import asyncHandler from '../middleware/asyncHandler.js';
import Cart from '../models/cartModel.js';

// @desc    Get user's cart
// @route   GET /api/cart
// @access  Private
const getCart = asyncHandler(async (req, res) => {
  let cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    cart = await Cart.create({
      user: req.user._id,
      cartItems: [],
      shippingAddress: {},
      paymentMethod: 'Razorpay',
    });
  }

  res.json(cart);
});

// @desc    Update user's cart
// @route   PUT /api/cart
// @access  Private
const updateCart = asyncHandler(async (req, res) => {
  const { cartItems, shippingAddress, paymentMethod } = req.body;

  let cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    cart = await Cart.create({
      user: req.user._id,
      cartItems,
      shippingAddress,
      paymentMethod,
    });
  } else {
    if (cartItems) cart.cartItems = cartItems;
    if (shippingAddress) cart.shippingAddress = shippingAddress;
    if (paymentMethod) cart.paymentMethod = paymentMethod;
  }

  const updatedCart = await cart.save();
  res.json(updatedCart);
});

// @desc    Clear user's cart
// @route   DELETE /api/cart
// @access  Private
const clearCart = asyncHandler(async (req, res) => {
  await Cart.deleteOne({ user: req.user._id });
  res.json({ message: 'Cart cleared' });
});

export { getCart, updateCart, clearCart };
