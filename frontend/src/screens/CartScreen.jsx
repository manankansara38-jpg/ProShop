import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Row,
  Col,
  ListGroup,
  Image,
  Form,
  Button,
  Card,
} from 'react-bootstrap';
import { FaTrash } from 'react-icons/fa';
import Message from '../components/Message';
import { addToCart, removeFromCart } from '../slices/cartSlice';

const CartScreen = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const cart = useSelector((state) => state.cart);
  const { cartItems } = cart;

  // NOTE: no need for an async function here as we are not awaiting the
  // resolution of a Promise
  const addToCartHandler = (product, qty) => {
    dispatch(addToCart({ ...product, qty }));
  };

  const removeFromCartHandler = (id) => {
    dispatch(removeFromCart(id));
  };

  const checkoutHandler = () => {
    navigate('/login?redirect=/shipping');
  };

  return (
    <Row>
      <Col md={8}>
        <h1 style={{ marginBottom: '20px' }}>Shopping Cart</h1>
        {!cartItems || cartItems.length === 0 ? (
          <Message>
            Your cart is empty <Link to='/'>Go Back</Link>
          </Message>
        ) : (
          <ListGroup variant='flush' className='cart-list'>
            {cartItems.map((item) => (
              <ListGroup.Item key={item._id} className='cart-item'>
                <div className='cart-item-inner'>
                  <div className='cart-thumb'>
                    <Image src={item.image} alt={item.name} fluid />
                  </div>

                  <div className='cart-meta'>
                    <Link to={`/product/${item._id}`} className='cart-name'>
                      {item.name}
                    </Link>
                    <div className='cart-brand'>{item.brand}</div>
                    <div className='cart-price'>
                      {item.discountPrice && Number(item.discountPrice) < Number(item.price) ? (
                        <div>
                          <div style={{ color: '#888', textDecoration: 'line-through', fontSize: '0.9rem' }}>₹{Number(item.price).toFixed(2)}</div>
                          <div style={{ color: '#ff6b35', fontWeight: 700 }}>₹{Number(item.discountPrice).toFixed(2)}</div>
                        </div>
                      ) : (
                        <div style={{ color: '#ff6b35', fontWeight: 700 }}>₹{Number(item.price).toFixed(2)}</div>
                      )}
                    </div>
                    <div className='cart-controls'>
                      <Form.Control
                        as='select'
                        value={item.qty}
                        onChange={(e) =>
                          addToCartHandler(item, Number(e.target.value))
                        }
                        className='cart-qty'
                      >
                        {[...Array(item.countInStock).keys()].map((x) => (
                          <option key={x + 1} value={x + 1}>
                            {x + 1}
                          </option>
                        ))}
                      </Form.Control>
                      <Button
                        type='button'
                        variant='outline-danger'
                        className='cart-remove'
                        onClick={() => removeFromCartHandler(item._id)}
                        title='Remove item'
                      >
                        <FaTrash />
                      </Button>
                    </div>
                  </div>
                </div>
              </ListGroup.Item>
            ))}
          </ListGroup>
        )}
      </Col>

      <Col md={4}>
        <Card className='cart-summary-card'>
          <ListGroup variant='flush'>
            <ListGroup.Item>
              <h3 className='summary-title'>Order Summary</h3>
              <div className='summary-row'>
                <span>Items</span>
                <strong>{cartItems?.reduce((acc, item) => acc + item.qty, 0)}</strong>
              </div>
              <div className='summary-row'>
                <span>Subtotal</span>
                <strong>₹{cart.itemsPrice || '0.00'}</strong>
              </div>
              <div className='summary-row'>
                <span>Shipping</span>
                <strong>₹{cart.shippingPrice || '0.00'}</strong>
              </div>
              <div className='summary-row'>
                <span>Tax</span>
                <strong>₹{cart.taxPrice || '0.00'}</strong>
              </div>
              <div className='summary-row' style={{ marginTop: '8px' }}>
                <span>Total</span>
                <strong>₹{cart.totalPrice || '0.00'}</strong>
              </div>
            </ListGroup.Item>
            <ListGroup.Item>
              <Button
                type='button'
                className='w-100'
                disabled={!cartItems || cartItems.length === 0}
                onClick={checkoutHandler}
                variant='primary'
              >
                Proceed To Checkout
              </Button>
            </ListGroup.Item>
          </ListGroup>
        </Card>
      </Col>
    </Row>
  );
};

export default CartScreen;
