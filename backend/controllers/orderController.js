import asyncHandler from '../middleware/asyncHandler.js';
import Order from '../models/orderModel.js';
import Product from '../models/productModel.js';
import { calcPrices } from '../utils/calcPrices.js';
import sendEmail from '../utils/sendEmail.js';
import User from '../models/userModel.js';
import Coupon from '../models/couponModel.js';
import crypto from 'crypto';

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const addOrderItems = asyncHandler(async (req, res) => {
  const { orderItems, shippingAddress, paymentMethod, couponCode, couponDiscount } = req.body;

  console.log('📥 CREATE ORDER REQUEST:');
  try {
    console.log('  user:', req.user?._id || 'anonymous');
    console.log('  orderItems:', JSON.stringify(orderItems || []));
    console.log('  shippingAddress:', JSON.stringify(shippingAddress || {}));
    console.log('  paymentMethod:', paymentMethod);
    console.log('  couponCode:', couponCode, 'couponDiscount:', couponDiscount);
  } catch (e) {
    console.error('Error logging create order request:', e);
  }

  // Validate coupon and check if user has already used it
  if (couponCode) {
    const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });
    if (!coupon) {
      res.status(404);
      throw new Error('Coupon not found');
    }
    if (!coupon.isActive) {
      res.status(400);
      throw new Error('Coupon is inactive');
    }
    
    // Check if coupon has expired
    if (coupon.expiryDate && new Date() > coupon.expiryDate) {
      res.status(400);
      throw new Error('Coupon has expired');
    }
    
    // Check if user has already used this coupon
    if (coupon.usedBy && coupon.usedBy.length > 0) {
      const userHasUsed = coupon.usedBy.some(id => id.toString() === req.user._id.toString());
      if (userHasUsed) {
        res.status(400);
        throw new Error('You have already used this coupon. Each coupon can only be used once.');
      }
    }
    
    // Check if coupon usage limit has been exceeded globally
    if (coupon.maxUsage && coupon.usageCount >= coupon.maxUsage) {
      res.status(400);
      throw new Error('Coupon usage limit exceeded');
    }
  }

  if (orderItems && orderItems.length === 0) {
    res.status(400);
    throw new Error('No order items');
  } else {
    // NOTE: here we must assume that the prices from our client are incorrect.
    // We must only trust the price of the item as it exists in
    // our DB. This prevents a user paying whatever they want by hacking our client
    // side code - https://gist.github.com/bushblade/725780e6043eaf59415fbaf6ca7376ff

    // get the ordered items from our database
    const requestedIds = orderItems.map((x) => x._id);
    const itemsFromDB = await Product.find({ _id: { $in: requestedIds } });

    console.log('  itemsFromDB found:', itemsFromDB.map((p) => p._id.toString()));

    // map over the order items and use the price from our items from database
    const dbOrderItems = orderItems.map((itemFromClient) => {
      const matchingItemFromDB = itemsFromDB.find(
        (itemFromDB) => itemFromDB._id.toString() === String(itemFromClient._id)
      );

      if (!matchingItemFromDB) {
        console.error('Product lookup failed for id:', itemFromClient._id);
        res.status(400);
        throw new Error(`Product not found: ${itemFromClient._id}`);
      }

      return {
        ...itemFromClient,
        product: itemFromClient._id,
        price: itemFromClient.price || matchingItemFromDB.price,
        discountPrice: matchingItemFromDB.discountPrice || undefined,
        _id: undefined,
      };
    });

    // Validate stock availability BEFORE creating the order
    for (const itemFromClient of orderItems) {
      const productInDB = itemsFromDB.find(
        (p) => p._id.toString() === itemFromClient._id
      );
      if (productInDB.countInStock < itemFromClient.qty) {
        res.status(400);
        throw new Error(
          `Insufficient stock for ${productInDB.name}. Available: ${productInDB.countInStock}, Requested: ${itemFromClient.qty}`
        );
      }
    }

    // calculate prices (calcPrices returns stringified values)
    const { itemsPrice, taxPrice, shippingPrice, totalPrice } =
      calcPrices(dbOrderItems);

    // Coerce returned prices to numbers for safe arithmetic and formatting
    const itemsPriceNum = Number(itemsPrice);
    const shippingPriceNum = Number(shippingPrice);
    const taxPriceNum = Number(taxPrice);
    const totalPriceNum = Number(totalPrice);

    // Ensure couponDiscount is numeric
    const couponDiscountNum = Number(couponDiscount) || 0;

    console.log('📋 ORDER ITEMS RECEIVED:');
    dbOrderItems.forEach((item, idx) => {
      console.log(`  Item ${idx + 1}: ${item.name || 'Unknown'} | Price: ₹${item.price} | Qty: ${item.qty} | Subtotal: ₹${item.price * item.qty}`);
    });
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('💰 FINAL PRICES FROM CALC:');
    console.log(`  Items Total: ${itemsPrice}`);
    console.log(`  Shipping (5% if >1000): ${shippingPrice}`);
    console.log(`  Tax (15%): ${taxPrice}`);
    console.log(`  Total Before Discount: ${totalPrice}`);
    
    // Apply coupon discount to final total price (work with numbers)
    let finalTotalPriceNum = totalPriceNum;
    if (couponDiscountNum > 0) {
      finalTotalPriceNum = totalPriceNum - couponDiscountNum;
      console.log(`  Coupon Discount: -${couponDiscountNum.toFixed(2)}`);
      console.log(`  Final Total After Discount: ${finalTotalPriceNum.toFixed(2)}`);
    }
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    const order = new Order({
      orderItems: dbOrderItems,
      user: req.user._id,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      itemsPrice: itemsPriceNum,
      taxPrice: taxPriceNum,
      shippingPrice: shippingPriceNum,
      totalPrice: parseFloat(finalTotalPriceNum.toFixed(2)),
      couponCode: couponCode || null,
      couponDiscount: couponDiscountNum || 0,
    });

    const createdOrder = await order.save();

    // If payment method is COD, notify admin about new COD order
    try {
      if (paymentMethod && paymentMethod.toUpperCase() === 'COD') {
        const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        const adminHtml = `
          <h2>New COD Order Received</h2>
          <p>Order ID: <strong>${createdOrder._id}</strong></p>
          <p>User: <strong>${req.user.email || 'Unknown'}</strong></p>
          <p>Total: <strong>₹${createdOrder.totalPrice.toFixed(2)}</strong></p>
          <p><a href="${frontendUrl}/admin/order/${createdOrder._id}">Open order in admin panel</a></p>
        `;

        if (adminEmail) {
          await sendEmail({
            to: adminEmail,
            subject: `New COD order #${createdOrder._id}`,
            html: adminHtml,
          });
          console.log('Admin notified about COD order:', createdOrder._id);
        }
      }
    } catch (adminNotifyErr) {
      console.error('Error notifying admin about COD order:', adminNotifyErr);
    }

    // Decrement product stock after successful order creation
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(
        item._id,
        { $inc: { countInStock: -item.qty } }
      );
    }

    res.status(201).json(createdOrder);
  }
});

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id });
  res.json(orders);
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate(
    'user',
    'name email'
  );

  if (order) {
    res.json(order);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
// @access  Private
const updateOrderToPaid = asyncHandler(async (req, res) => {
  try {
    console.log('💳 RAZORPAY PAYMENT UPDATE REQUEST:');
    console.log('  Order ID:', req.params.id);
    console.log('  Razorpay details:', {
      razorpayPaymentId: req.body.razorpayPaymentId,
      razorpayOrderId: req.body.razorpayOrderId,
    });

    // Validate that Razorpay payment ID is provided
    if (!req.body.razorpayPaymentId) {
      throw new Error('Razorpay Payment ID is missing');
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }

    // Check if order was already paid
    if (order.isPaid) {
      res.status(400);
      throw new Error('Order already paid');
    }

    // Mark order as paid
    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentResult = {
      id: req.body.razorpayPaymentId,
      status: 'COMPLETED',
      update_time: new Date().toISOString(),
      email_address: order.user?.email || 'customer@proshop.com',
    };

    const updatedOrder = await order.save();
    console.log('✅ Order marked as paid:', updatedOrder._id);

      // Send order confirmation email with bill summary
      try {
        const user = await User.findById(updatedOrder.user);
        if (user && user.email) {
          const orderItemsHtml = updatedOrder.orderItems
            .map(
              (item) =>
                `<tr>
              <td>${item.name}</td>
              <td>${item.qty}</td>
              <td>₹${item.price.toFixed(2)}</td>
              <td>₹${(item.qty * item.price).toFixed(2)}</td>
            </tr>`
            )
            .join('');

          const billHtml = `
            <h2>Order Confirmation - Bill Summary</h2>
            <p>Dear ${user.name},</p>
            <p>Thank you for your purchase! Your payment has been received and processed successfully.</p>
            
            <h3>Order Details</h3>
            <p><strong>Order ID:</strong> ${updatedOrder._id}</p>
            <p><strong>Order Date:</strong> ${new Date(updatedOrder.createdAt).toLocaleDateString()}</p>
            <p><strong>Payment Status:</strong> Paid</p>
            
            <h3>Shipping Address</h3>
            <p>${updatedOrder.shippingAddress.address}, ${updatedOrder.shippingAddress.city}, ${updatedOrder.shippingAddress.postalCode}, ${updatedOrder.shippingAddress.country}</p>
            
            <h3>Items Ordered</h3>
            <table border="1" cellpadding="8" style="border-collapse: collapse; width: 100%;">
              <tr>
                <th>Product</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Total</th>
              </tr>
              ${orderItemsHtml}
            </table>
            
            <h3>Bill Summary</h3>
            <table style="width: 300px; margin-top: 20px;">
              <tr>
                <td><strong>Items Price:</strong></td>
                <td>₹${updatedOrder.itemsPrice.toFixed(2)}</td>
              </tr>
              <tr>
                <td><strong>Shipping:</strong></td>
                <td>${parseFloat(updatedOrder.shippingPrice) === 0 ? 'Free Shipping' : `₹${updatedOrder.shippingPrice.toFixed(2)}`}</td>
              </tr>
              <tr>
                <td><strong>Tax:</strong></td>
                <td>₹${updatedOrder.taxPrice.toFixed(2)}</td>
              </tr>
              ${updatedOrder.couponDiscount > 0 ? `
              <tr style="color: green;">
                <td><strong>Coupon Discount (${updatedOrder.couponCode}):</strong></td>
                <td><strong>-₹${updatedOrder.couponDiscount.toFixed(2)}</strong></td>
              </tr>
              ` : ''}
              <tr style="border-top: 2px solid #000;">
                <td><strong>Total Price:</strong></td>
                <td><strong>₹${updatedOrder.totalPrice.toFixed(2)}</strong></td>
              </tr>
            </table>
            
            <p style="margin-top: 30px;">We will notify you once your order ships. Thank you for shopping with us!</p>
          `;

          await sendEmail({
            to: user.email,
            subject: `Order Confirmation - Order #${updatedOrder._id}`,
            html: billHtml,
          });
          console.log('Order confirmation email sent to:', user.email);
        }
      } catch (emailErr) {
        console.error('Error sending order confirmation email:', emailErr);
        // Do not fail the order payment if email fails
      }

      // Increment coupon usage if coupon was applied
      if (updatedOrder.couponCode) {
        try {
          await Coupon.findOneAndUpdate(
            { code: updatedOrder.couponCode },
            { 
              $inc: { usageCount: 1 },
              $addToSet: { usedBy: updatedOrder.user }
            }
          );
          console.log('Coupon usage count updated and user added to usedBy:', updatedOrder.couponCode);
        } catch (couponErr) {
          console.error('Error updating coupon usage:', couponErr);
        }
      }

      // Send thank you coupon for next order
      try {
        const user = await User.findById(updatedOrder.user);
        if (user) {
          // Create thank you coupon unique for this purchase
          const randomCode = crypto.randomBytes(4).toString('hex').toUpperCase();
          const thankYouCoupon = await Coupon.create({
            code: `THANKYOU${randomCode}`,
            discountValue: 20,
            couponType: 'thankyou',
            isActive: true,
            description: 'Thank you coupon for your purchase',
            maxUsage: 1, // Single use only
            assignedTo: [user._id], // Assign only to this user
          });

          const thankYouHtml = `
            <h2>Thank You for Your Purchase! 🙏</h2>
            <p>Hi ${user.name},</p>
            <p>We truly appreciate your business! Your order has been confirmed and payment received.</p>
            
            <h3>Exclusive Thank You Offer</h3>
            <p>As a token of our gratitude, we're giving you a <strong>20% discount code</strong> for your next order!</p>
            <p><strong>Use coupon code: ${thankYouCoupon.code}</strong></p>
            
            <p style="color: #666; font-size: 14px;">This code is valid for your next purchase only and can be used once.</p>
            
            <p>We look forward to serving you again!</p>
            <p>Best regards,<br>The ProShop Team</p>
          `;

          await sendEmail({
            to: user.email,
            subject: 'Thank You for Your Order! Here\'s Your Next Purchase Discount 🎁',
            html: thankYouHtml,
          });
          console.log('Thank you coupon email sent to:', user.email);
        }
      } catch (thankYouErr) {
        console.error('Error sending thank you coupon:', thankYouErr);
        // Don't fail payment if thank you coupon fails
      }

      res.json(updatedOrder);
  } catch (err) {
    console.error('Payment update error:', err.message);
    throw err;
  }
});

// @desc    Update order to delivered
// @route   GET /api/orders/:id/deliver
// @access  Private/Admin
const updateOrderToDelivered = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email');

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  if (order.isDelivered) {
    res.status(400);
    throw new Error('Order already delivered');
  }

  // Mark delivered
  order.isDelivered = true;
  order.deliveredAt = Date.now();

  // If COD, mark as paid upon delivery
  let wasMarkedPaid = false;
  if (order.paymentMethod && order.paymentMethod.toUpperCase() === 'COD') {
    order.isPaid = true;
    order.paidAt = Date.now();
    wasMarkedPaid = true;
  }

  const updatedOrder = await order.save();

  // If order was marked paid (COD), perform same post-payment actions:
  if (wasMarkedPaid) {
    try {
      // Increment coupon usage if coupon was applied
      if (updatedOrder.couponCode) {
        await Coupon.findOneAndUpdate(
          { code: updatedOrder.couponCode },
          {
            $inc: { usageCount: 1 },
            $addToSet: { usedBy: updatedOrder.user }
          }
        );
        console.log('Coupon usage count updated and user added to usedBy:', updatedOrder.couponCode);
      }
    } catch (couponErr) {
      console.error('Error updating coupon usage after COD delivery:', couponErr);
    }

    // Send thank you coupon for next order
    try {
      const user = await User.findById(updatedOrder.user);
      if (user) {
        const randomCode = crypto.randomBytes(4).toString('hex').toUpperCase();
        const thankYouCoupon = await Coupon.create({
          code: `THANKYOU${randomCode}`,
          discountValue: 20,
          couponType: 'thankyou',
          isActive: true,
          description: 'Thank you coupon for your purchase',
          maxUsage: 1,
          assignedTo: [user._id],
        });

        const thankYouHtml = `
          <h2>Thank You for Your Purchase! 🙏</h2>
          <p>Hi ${user.name},</p>
          <p>Your order ${updatedOrder._id} has been delivered successfully.</p>
          <p>Here's a coupon for your next purchase: <strong>${thankYouCoupon.code}</strong></p>
        `;

        await sendEmail({
          to: user.email,
          subject: `Thank you - Order ${updatedOrder._id} delivered`,
          html: thankYouHtml,
        });
        console.log('Thank you coupon email sent to:', user.email);
      }
    } catch (thankYouErr) {
      console.error('Error sending thank you coupon after COD delivery:', thankYouErr);
    }
  }

  // Notify customer about delivery (and payment if COD)
  try {
    const user = await User.findById(updatedOrder.user);
    if (user && user.email) {
      const deliveredHtml = `
        <h2>Order Delivered</h2>
        <p>Hi ${user.name},</p>
        <p>Your order <strong>${updatedOrder._id}</strong> has been marked as delivered.</p>
        ${wasMarkedPaid ? '<p>Payment for your COD order was recorded at delivery.</p>' : ''}
      `;

      await sendEmail({
        to: user.email,
        subject: `Order ${updatedOrder._id} - Delivered`,
        html: deliveredHtml,
      });
      console.log('Delivery notification sent to:', user.email);
    }
  } catch (emailErr) {
    console.error('Error sending delivery notification email:', emailErr);
  }

  res.json(updatedOrder);
});

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({}).populate('user', 'id name email');
  res.json(orders);
});

export {
  addOrderItems,
  getMyOrders,
  getOrderById,
  updateOrderToPaid,
  updateOrderToDelivered,
  getOrders,
};
