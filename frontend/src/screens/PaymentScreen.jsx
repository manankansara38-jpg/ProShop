import { useState, useEffect } from 'react';
import { Form, Button, Col, Container, Row, Card, ListGroup, Image } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
// use full-width container to align summary on right
import CheckoutSteps from '../components/CheckoutSteps';
import { savePaymentMethod } from '../slices/cartSlice';

const PaymentScreen = () => {
  const navigate = useNavigate();
  const cart = useSelector((state) => state.cart);
  const { shippingAddress } = cart;

  useEffect(() => {
    if (!shippingAddress.address) {
      navigate('/shipping');
    }
  }, [navigate, shippingAddress]);

  const [paymentMethod, setPaymentMethod] = useState('Razorpay');

  const dispatch = useDispatch();

  const submitHandler = (e) => {
    e.preventDefault();
    dispatch(savePaymentMethod(paymentMethod));
    navigate('/placeorder');
  };

  return (
    <Container fluid className='payment-page-container'>
      <Row className='justify-content-center mb-3'>
        <Col xs={12} md={10}>
          <CheckoutSteps step1 step2 step3 />
          <h1>Payment Method</h1>
        </Col>
      </Row>

      <Row className='shipping-card justify-content-center'>
        <Col xs={12} md={8} lg={6}>
          <Card className='shipping-form-card checkout-card'>
            <Card.Body>
              <Card.Title className='mb-3 page-title'>Payment Method</Card.Title>
              <Form onSubmit={submitHandler}>
                <Form.Group>
                  <Form.Label as='legend'>Select Method</Form.Label>
                  <Col>
                    <Form.Check
                      className='my-2'
                      type='radio'
                      label='Razorpay - Credit/Debit/UPI'
                      id='Razorpay'
                      name='paymentMethod'
                      value='Razorpay'
                      checked={paymentMethod === 'Razorpay'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    ></Form.Check>

                    <Form.Check
                      className='my-2'
                      type='radio'
                      label='Cash On Delivery (COD)'
                      id='COD'
                      name='paymentMethod'
                      value='COD'
                      checked={paymentMethod === 'COD'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    ></Form.Check>
                  </Col>
                </Form.Group>

                <div className='mt-3'>
                  <Button type='submit' variant='primary'>
                    Continue
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default PaymentScreen;
