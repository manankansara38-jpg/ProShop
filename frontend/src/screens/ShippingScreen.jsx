import { useState } from 'react';
import { Form, Button, Row, Col, Card, ListGroup, Image, Container } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
// use full-width container for shipping layout
import CheckoutSteps from '../components/CheckoutSteps';
import { saveShippingAddress } from '../slices/cartSlice';

const ShippingScreen = () => {
  const cart = useSelector((state) => state.cart);
  const { shippingAddress } = cart;

  const [address, setAddress] = useState(shippingAddress.address || '');
  const [city, setCity] = useState(shippingAddress.city || '');
  const [postalCode, setPostalCode] = useState(
    shippingAddress.postalCode || ''
  );
  const [country, setCountry] = useState(shippingAddress.country || '');

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const submitHandler = (e) => {
    e.preventDefault();
    dispatch(saveShippingAddress({ address, city, postalCode, country }));
    navigate('/payment');
  };

  return (
    <Container fluid className='shipping-page-container'>
      <Row className='justify-content-center mb-3'>
        <Col xs={12} md={10}>
          <CheckoutSteps step1 step2 />
          <h1>Shipping</h1>
        </Col>
      </Row>

      <Row className='shipping-card justify-content-center'>
        <Col xs={12} md={8} lg={6}>
          <Card className='shipping-form-card checkout-card'>
            <Card.Body>
              <Card.Title className='mb-3 page-title'>Delivery Address</Card.Title>
              <Form onSubmit={submitHandler} className='shipping-form'>
                <Form.Group className='my-2' controlId='address'>
                  <Form.Label>Address</Form.Label>
                  <Form.Control
                    type='text'
                    placeholder='Enter address'
                    value={address}
                    required
                    onChange={(e) => setAddress(e.target.value)}
                  ></Form.Control>
                </Form.Group>

                <Row>
                  <Col md={6}>
                    <Form.Group className='my-2' controlId='city'>
                      <Form.Label>City</Form.Label>
                      <Form.Control
                        type='text'
                        placeholder='Enter city'
                        value={city}
                        required
                        onChange={(e) => setCity(e.target.value)}
                      ></Form.Control>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className='my-2' controlId='postalCode'>
                      <Form.Label>Postal Code</Form.Label>
                      <Form.Control
                        type='text'
                        placeholder='Enter postal code'
                        value={postalCode}
                        required
                        onChange={(e) => setPostalCode(e.target.value)}
                      ></Form.Control>
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className='my-2' controlId='country'>
                  <Form.Label>Country</Form.Label>
                  <Form.Control
                    type='text'
                    placeholder='Enter country'
                    value={country}
                    required
                    onChange={(e) => setCountry(e.target.value)}
                  ></Form.Control>
                </Form.Group>

                <div className='d-flex justify-content-end mt-3'>
                  <Button type='submit' variant='success'>
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

export default ShippingScreen;
