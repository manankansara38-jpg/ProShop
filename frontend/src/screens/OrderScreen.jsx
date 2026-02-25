import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Row, Col, ListGroup, Image, Card, Button } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import Message from '../components/Message';
import Loader from '../components/Loader';
import {
  useDeliverOrderMutation,
  useGetOrderDetailsQuery,
  usePayOrderMutation,
} from '../slices/ordersApiSlice';

const OrderScreen = () => {
  const { id: orderId } = useParams();
  const [loading, setLoading] = useState(false);

  const {
    data: order,
    refetch,
    isLoading,
    error,
  } = useGetOrderDetailsQuery(orderId);

  const [payOrder, { isLoading: loadingPay }] = usePayOrderMutation();

  const [deliverOrder, { isLoading: loadingDeliver }] =
    useDeliverOrderMutation();

  const { userInfo } = useSelector((state) => state.auth);

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
  }, []);

  const handleRazorpayPayment = async () => {
    if (!order || !order._id) return;
    
    setLoading(true);
    try {
      // Fetch Razorpay Key ID from backend
      const keyResponse = await fetch('/api/config/razorpay');
      const { keyId } = await keyResponse.json();

      if (!keyId) {
        toast.error('Payment configuration missing. Please contact support.');
        setLoading(false);
        return;
      }

      const options = {
        key: keyId, // Get from backend environment
        amount: Math.round(order.totalPrice * 100), // Amount in paise (multiply by 100)
        currency: 'INR',
        name: 'ProShop',
        description: `Order #${order._id}`,
        handler: async function (response) {
          try {
            console.log('✅ Razorpay Payment Successful:', {
              paymentId: response.razorpay_payment_id,
              orderId: response.razorpay_order_id,
            });
            
            // Show processing message
            toast.info('Processing payment confirmation...', { autoClose: false });
            
            // Send payment details to backend
            const result = await payOrder({
              orderId,
              details: {
                razorpayPaymentId: response.razorpay_payment_id,
                razorpayOrderId: response.razorpay_order_id,
              },
            }).unwrap();
            
            console.log('✅ Payment confirmed. Order details:', result);
            
            // Refresh order details
            await refetch();
            
            // Dismiss processing toast and show success
            toast.dismiss();
            toast.success('🎉 Order is paid successfully! Confirmation email will be sent shortly.', { autoClose: 5000 });
          } catch (err) {
            console.error('❌ Payment verification error:', err);
            toast.dismiss();
            toast.error(err?.data?.message || 'Payment verification failed. Please try again.');
          }
        },
        prefill: {
          name: order.user?.name || 'Customer',
          email: order.user?.email || 'customer@proshop.com',
          contact: '9999999999',
        },
        theme: {
          color: '#007bff',
        },
      };

      if (!window.Razorpay) {
        toast.error('Razorpay is not loaded. Please refresh the page.');
        setLoading(false);
        return;
      }

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (err) {
      console.error('Payment initiation error:', err);
      toast.error('Failed to initiate payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // TESTING ONLY! REMOVE BEFORE PRODUCTION
  async function onApproveTest() {
    try {
      await payOrder({ orderId, details: { payer: {} } }).unwrap();
      refetch();
      toast.success('Order is paid (TEST)');
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  }

  const deliverHandler = async () => {
    await deliverOrder(orderId);
    refetch();
  };

  return isLoading ? (
    <Loader />
  ) : error ? (
    <Message variant='danger'>{error.data.message}</Message>
  ) : (
    <>
      <div className='order-page'>
        <Link to='/' className='btn btn-light mb-4'>
          ← Back to Home
        </Link>
        <h1>Order {order._id}</h1>
        <Row>
        <Col md={8}>
          <ListGroup variant='flush'>
            <ListGroup.Item className='shipping-card'>
              <h2>Shipping</h2>
              <p>
                <strong>Name: </strong> {order.user.name}
              </p>
              <p>
                <strong>Email: </strong>{' '}
                <a href={`mailto:${order.user.email}`}>{order.user.email}</a>
              </p>
              <p>
                <strong>Address:</strong>
                {order.shippingAddress.address}, {order.shippingAddress.city}{' '}
                {order.shippingAddress.postalCode},{' '}
                {order.shippingAddress.country}
              </p>
              {order.isDelivered ? (
                <Message variant='success'>
                  Delivered on {order.deliveredAt}
                </Message>
              ) : (
                <Message variant='danger'>Not Delivered</Message>
              )}
            </ListGroup.Item>

            <ListGroup.Item className='payment-card'>
              <h2>Payment Method</h2>
              <p>
                <strong>Method: </strong>
                {order.paymentMethod}
              </p>
              {order.isPaid ? (
                <Message variant='success'>Paid on {order.paidAt}</Message>
              ) : (
                <Message variant='danger'>Not Paid</Message>
              )}
            </ListGroup.Item>

            <ListGroup.Item className='order-items'>
              <h2>Order Items</h2>
              {order.orderItems.length === 0 ? (
                <Message>Order is empty</Message>
              ) : (
                <ListGroup variant='flush'>
                  {order.orderItems.map((item, index) => (
                    <ListGroup.Item key={index} className='order-item-card'>
                      <Row className='align-items-center'>
                        <Col md={3} xs={4} className='order-item-image-col'>
                          <Image
                            src={item.image}
                            alt={item.name}
                            fluid
                            rounded
                            className='order-item-image'
                          />
                        </Col>
                        <Col md={6} xs={8} className='order-item-details'>
                          <Link to={`/product/${item.product}`} className='order-item-name'>
                            {item.name}
                          </Link>
                          <div className='order-item-qty-price mt-2'>
                            <span className='qty-badge'>{item.qty}</span>
                            {item.discountPrice && item.discountPrice < item.price ? (
                              <>
                                <span className='price-text' style={{ textDecoration: 'line-through', color: '#999' }}>x ₹{item.price.toFixed(2)}</span>
                                <span className='price-text' style={{ fontWeight: 700, color: '#ff6b35' }}>x ₹{item.discountPrice.toFixed(2)}</span>
                              </>
                            ) : (
                              <span className='price-text'>x ₹{item.price.toFixed(2)}</span>
                            )}
                            <span className='total-text'>=</span>
                            <span className='item-total'>₹{(item.qty * (item.discountPrice && item.discountPrice < item.price ? item.discountPrice : item.price)).toFixed(2)}</span>
                          </div>
                        </Col>
                      </Row>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}
            </ListGroup.Item>
          </ListGroup>
        </Col>
        <Col md={4}>
          <Card className='order-summary-card'>
            <ListGroup variant='flush'>
              <ListGroup.Item>
                <h2>Order Summary</h2>
              </ListGroup.Item>
              <ListGroup.Item>
                <Row>
                  <Col>Items</Col>
                  <Col>₹{order.itemsPrice}</Col>
                </Row>
              </ListGroup.Item>
              <ListGroup.Item>
                <Row>
                  <Col>Shipping</Col>
                  <Col>
                    {order.shippingPrice === '0.00' || order.shippingPrice === 0 || parseFloat(order.shippingPrice) === 0
                      ? 'Free Shipping'
                      : `₹${order.shippingPrice}`}
                  </Col>
                </Row>
              </ListGroup.Item>
              <ListGroup.Item>
                <Row>
                  <Col>Tax</Col>
                  <Col>₹{order.taxPrice}</Col>
                </Row>
              </ListGroup.Item>
              {order.couponDiscount > 0 && (
                <ListGroup.Item>
                  <Row className='text-success'>
                    <Col>Coupon Discount ({order.couponCode})</Col>
                    <Col>-₹{order.couponDiscount.toFixed(2)}</Col>
                  </Row>
                </ListGroup.Item>
              )}
              <ListGroup.Item>
                <Row>
                  <Col><strong>Total</strong></Col>
                  <Col><strong>₹{order.totalPrice}</strong></Col>
                </Row>
              </ListGroup.Item>
              {!order.isPaid && order.paymentMethod === 'Razorpay' && (
                <ListGroup.Item>
                  {loadingPay && <Loader />}

                  <div>
                    <Button
                      variant='primary'
                      style={{ width: '100%' }}
                      onClick={handleRazorpayPayment}
                      disabled={loading || loadingPay}
                    >
                      {loading ? 'Processing...' : 'Pay with Razorpay ₹' + order.totalPrice}
                    </Button>
                  </div>
                </ListGroup.Item>
              )}

              {loadingDeliver && <Loader />}

              {userInfo &&
                userInfo.isAdmin &&
                !order.isDelivered &&
                (order.isPaid || order.paymentMethod === 'COD') && (
                  <ListGroup.Item>
                    <Button
                      type='button'
                      className='btn btn-block'
                      onClick={deliverHandler}
                    >
                      Mark As Delivered
                    </Button>
                  </ListGroup.Item>
                )}
            </ListGroup>
          </Card>
        </Col>
      </Row>
      </div>
    </>
  );
};

export default OrderScreen;
