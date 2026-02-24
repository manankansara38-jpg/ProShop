import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Button, Row, Col, ListGroup, Image, Card, Container, Form, Modal } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import Message from '../components/Message';
import CheckoutSteps from '../components/CheckoutSteps';
import Loader from '../components/Loader';
import CouponInput from '../components/CouponInput';
import AvailableCoupons from '../components/AvailableCoupons';
import { useCreateOrderMutation } from '../slices/ordersApiSlice';
import { useClearCartMutation } from '../slices/cartApiSlice';
import { clearCartItems, savePaymentMethod } from '../slices/cartSlice';

const PlaceOrderScreen = () => {
  const navigate = useNavigate();
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [tempPaymentMethod, setTempPaymentMethod] = useState('');

  const cart = useSelector((state) => state.cart);
  const dispatch = useDispatch();

  const [createOrder, { isLoading, error }] = useCreateOrderMutation();
  const [clearCartApi] = useClearCartMutation();

  useEffect(() => {
    if (!cart.shippingAddress.address) {
      navigate('/shipping');
    } else if (!cart.paymentMethod) {
      navigate('/payment');
    }
    setTempPaymentMethod(cart.paymentMethod);
  }, [cart.paymentMethod, cart.shippingAddress.address, navigate]);

  const handleEditPayment = () => {
    setTempPaymentMethod(cart.paymentMethod);
    setShowPaymentModal(true);
  };

  const handleSavePayment = () => {
    dispatch(savePaymentMethod(tempPaymentMethod));
    setShowPaymentModal(false);
  };

  const handleCancelPayment = () => {
    setShowPaymentModal(false);
  };

  const placeOrderHandler = async () => {
    try {
      // Coupon is OPTIONAL - calculate total with or without discount
      const finalTotal = appliedCoupon 
        ? parseFloat((cart.totalPrice - appliedCoupon.discountAmount).toFixed(2))
        : parseFloat(cart.totalPrice);
      // Ensure order items include `_id` (some cart items use `product`) and use discounted price when available
      const orderItemsForServer = cart.cartItems.map((item) => {
        const unitPrice = item.discountPrice && Number(item.discountPrice) < Number(item.price) ? Number(item.discountPrice) : Number(item.price);
        return {
          _id: item._id || item.product,
          qty: item.qty,
          name: item.name,
          image: item.image,
          price: unitPrice,
        };
      });

      const res = await createOrder({
        orderItems: orderItemsForServer,
        shippingAddress: cart.shippingAddress,
        paymentMethod: cart.paymentMethod,
        itemsPrice: cart.itemsPrice,
        shippingPrice: cart.shippingPrice,
        taxPrice: cart.taxPrice,
        totalPrice: finalTotal,
        couponCode: appliedCoupon?.code || null,
        couponDiscount: appliedCoupon?.discountAmount || 0,
      }).unwrap();
      // Clear cart from server and local state
      await clearCartApi().unwrap();
      dispatch(clearCartItems());
      navigate(`/order/${res._id}`);
    } catch (err) {
      toast.error(err?.data?.message || err.message || 'Failed to place order');
    }
  };

  return (
    <Container fluid className='checkout-page-container'>
      <CheckoutSteps step1 step2 step3 step4 />
      <Row className='mt-3'>
        <Col md={8} className='placeorder-left'>
          <ListGroup variant='flush'>
            <ListGroup.Item>
              <h2 className='page-title'>Shipping</h2>
              <p className='checkout-meta'>
                <span className='checkout-label'>Address</span>
                <span className='checkout-value'>
                  {cart.shippingAddress.address}, {cart.shippingAddress.city} {cart.shippingAddress.postalCode}, {cart.shippingAddress.country}
                </span>
              </p>
              <Link to='/shipping' className='btn btn-sm btn-outline-primary mt-2'>
                Edit Address
              </Link>
            </ListGroup.Item>

            <ListGroup.Item>
              <h2 className='page-title'>Payment Method</h2>
              <p className='checkout-meta'>
                <span className='checkout-label'>Method</span>
                <span className='checkout-value'>{cart.paymentMethod}</span>
              </p>
              <Button 
                variant='outline-primary' 
                size='sm' 
                className='mt-2'
                onClick={handleEditPayment}
              >
                Change Payment Method
              </Button>
            </ListGroup.Item>

            <ListGroup.Item>
              <h2 className='page-title'>Order Items</h2>
              {cart.cartItems.length === 0 ? (
                <Message>Your cart is empty</Message>
              ) : (
                <ListGroup variant='flush'>
                  {cart.cartItems.map((item, index) => (
                    <ListGroup.Item key={index} className='d-flex align-items-center order-item'>
                      <div className='order-thumb'>
                        <Image src={item.image} alt={item.name} fluid />
                      </div>
                      <div className='order-item-info'>
                        <Link to={`/product/${item.product}`} className='order-item-name'>
                          {item.name}
                        </Link>
                        {(() => {
                          const unitPrice = item.discountPrice && Number(item.discountPrice) < Number(item.price) ? Number(item.discountPrice) : Number(item.price);
                          return <div className='order-item-meta'>{item.qty} x ₹{unitPrice.toFixed(2)} = ₹{(item.qty * unitPrice).toFixed(2)}</div>;
                        })()}
                      </div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}
            </ListGroup.Item>
          </ListGroup>
        </Col>
        <Col md={4} className='placeorder-right'>
          <AvailableCoupons
            onCouponSelect={(code) => {
              document.getElementById('coupon-input').value = code;
              document.getElementById('coupon-input').dispatchEvent(
                new Event('input', { bubbles: true })
              );
            }}
          />
          <CouponInput
            orderTotal={
              (parseFloat(cart.itemsPrice) || 0) + (parseFloat(cart.shippingPrice) || 0) + (parseFloat(cart.taxPrice) || 0)
            }
            onCouponApply={setAppliedCoupon}
          />

          <Card className='checkout-card order-summary-card'>
            <ListGroup variant='flush'>
              <ListGroup.Item>
                <h2 className='page-title'>Order Summary</h2>
              </ListGroup.Item>
              <ListGroup.Item className='summary-row'>
                <div>Items</div>
                <div className='summary-value'>₹{cart.itemsPrice}</div>
              </ListGroup.Item>
              <ListGroup.Item className='summary-row'>
                <div>Shipping</div>
                <div className='summary-value'>{cart.shippingPrice === '0.00' || cart.shippingPrice === 0 ? 'Free' : `₹${cart.shippingPrice}`}</div>
              </ListGroup.Item>
              <ListGroup.Item className='summary-row'>
                <div>Tax</div>
                <div className='summary-value'>₹{cart.taxPrice}</div>
              </ListGroup.Item>
              {appliedCoupon && (
                <ListGroup.Item className='summary-row text-success'>
                  <div>Coupon ({appliedCoupon.code})</div>
                  <div className='summary-value'>-₹{appliedCoupon.discountAmount.toFixed(2)}</div>
                </ListGroup.Item>
              )}
              <ListGroup.Item className='summary-row total-row'>
                <div><strong>Total</strong></div>
                <div className='summary-value'><strong>₹{appliedCoupon ? (cart.totalPrice - appliedCoupon.discountAmount).toFixed(2) : cart.totalPrice}</strong></div>
              </ListGroup.Item>
              <ListGroup.Item>
                {error && (
                  <Message variant='danger'>{error.data.message}</Message>
                )}
              </ListGroup.Item>
              <ListGroup.Item>
                <Button
                  type='button'
                  className='place-order-btn w-100'
                  disabled={cart.cartItems.length === 0}
                  onClick={placeOrderHandler}
                >
                  Place Order
                </Button>
                {isLoading && <Loader />}
              </ListGroup.Item>
            </ListGroup>
          </Card>
        </Col>
      </Row>

      {/* Payment Method Edit Modal */}
      <Modal show={showPaymentModal} onHide={handleCancelPayment} centered>
        <Modal.Header closeButton>
          <Modal.Title>Change Payment Method</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label as='legend'>Select Method</Form.Label>
              <div>
                <Form.Check
                  type='radio'
                  label='Razorpay - Credit/Debit/UPI'
                  id='modal-razorpay'
                  name='paymentMethod'
                  value='Razorpay'
                  checked={tempPaymentMethod === 'Razorpay'}
                  onChange={(e) => setTempPaymentMethod(e.target.value)}
                  className='my-2'
                />
                <Form.Check
                  type='radio'
                  label='Cash On Delivery (COD)'
                  id='modal-cod'
                  name='paymentMethod'
                  value='COD'
                  checked={tempPaymentMethod === 'COD'}
                  onChange={(e) => setTempPaymentMethod(e.target.value)}
                  className='my-2'
                />
              </div>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant='secondary' onClick={handleCancelPayment}>
            Cancel
          </Button>
          <Button variant='primary' onClick={handleSavePayment}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default PlaceOrderScreen;
