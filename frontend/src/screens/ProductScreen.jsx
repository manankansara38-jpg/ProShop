import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Row,
  Col,
  Image,
  ListGroup,
  Card,
  Button,
  Form,
} from 'react-bootstrap';
import { toast } from 'react-toastify';
import {
  useGetProductDetailsQuery,
  useCreateReviewMutation,
} from '../slices/productsApiSlice';
import Rating from '../components/Rating';
import Loader from '../components/Loader';
import Message from '../components/Message';
import Meta from '../components/Meta';
import { addToCart } from '../slices/cartSlice';

const ProductScreen = () => {
  const { id: productId } = useParams();

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [qty, setQty] = useState(1);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  const addToCartHandler = () => {
    dispatch(addToCart({ ...product, qty }));
    navigate('/cart');
  };

  const {
    data: product,
    isLoading,
    refetch,
    error,
  } = useGetProductDetailsQuery(productId);

  const { userInfo } = useSelector((state) => state.auth);

  const [createReview, { isLoading: loadingProductReview }] =
    useCreateReviewMutation();

  const submitHandler = async (e) => {
    e.preventDefault();

    try {
      await createReview({
        productId,
        rating,
        comment,
      }).unwrap();
      refetch();
      toast.success('Review created successfully');
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  // Debug: log session/redux auth when product page mounts/changes
  useEffect(() => {
    try {
      console.log('ProductScreen mounted', {
        productId,
        sessionUser: sessionStorage.getItem('userInfo'),
        adminInfo: sessionStorage.getItem('adminInfo'),
        reduxUser: userInfo,
      });
    } catch (e) {}
  }, [productId, userInfo]);

  return (
    <>
      <Link className='btn btn-light my-3' to='/'>
        Go Back
      </Link>
      {isLoading ? (
        <Loader />
      ) : error ? (
        <Message variant='danger'>
          {error?.data?.message || error.error}
        </Message>
      ) : (
        <>
          <Meta title={product.name} description={product.description} />
          
          {/* Main Product Section */}
          <Row className='mb-5'>
            {/* Left Column: Image and Product Info */}
            <Col lg={6} className='mb-4 mb-lg-0'>
              {/* Product Image */}
              <div className='product-image-container' style={{ position: 'relative' }}>
                {product.discountPrice && product.discountPrice < product.price && (
                  (() => {
                    const perc = Math.round(((product.price - product.discountPrice) / product.price) * 100);
                    return <div className='discount-badge'>-{perc}%</div>;
                  })()
                )}
                <Image src={product.image} alt={product.name} fluid className='product-image' />
              </div>

              {/* Product Info Section - Below Image */}
              <div className='product-info-section mt-4'>
                <div style={{ marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '2px solid #ff6b35' }}>
                  <span style={{ fontSize: '0.75rem', color: '#ff6b35', fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase' }}>Brand</span>
                  <h2 style={{ fontSize: '2rem', color: '#ff6b35', fontWeight: '800', margin: '0.5rem 0 0 0' }}>
                    {product.brand}
                  </h2>
                </div>
                <h1 className='product-detail-name'>{product.name}</h1>
                <div className='product-rating-section'>
                  <Rating
                    value={product.rating}
                    text={`${product.numReviews} reviews`}
                  />
                </div>
                <p className='product-description'>{product.description}</p>
              </div>
            </Col>

            {/* Right Column: Add to Cart */}
            <Col lg={6}>
              <Card className='product-purchase-card'>
                <Card.Body>
                  {/* Price Section */}
                  <div className='price-section'>
                    <span className='price-label'>Price</span>
                    {product.discountPrice && product.discountPrice < product.price ? (
                      <div>
                        <div style={{ fontSize: '1rem', color: '#888', textDecoration: 'line-through', marginBottom: '6px' }}>
                          ₹{product.price}
                        </div>
                        <h2 className='price-value' style={{ color: '#ff6b35' }}>₹{product.discountPrice}</h2>
                      </div>
                    ) : (
                      <h2 className='price-value'>₹{product.price}</h2>
                    )}
                  </div>

                  {/* Status Section */}
                  <div className='status-section'>
                    <span className={`status-badge ${product.countInStock > 0 ? 'in-stock' : 'out-of-stock'}`}>
                      {product.countInStock > 0 ? '✓ In Stock' : '✗ Out Of Stock'}
                    </span>
                    {product.countInStock > 0 && (
                      <span className='stock-count'>
                        {product.countInStock} items available
                      </span>
                    )}
                  </div>

                  {/* Quantity Section */}
                  {product.countInStock > 0 && (
                    <div className='quantity-section'>
                      <label className='quantity-label'>Quantity</label>
                      <Form.Control
                        as='select'
                        value={qty}
                        onChange={(e) => setQty(Number(e.target.value))}
                        className='quantity-select'
                      >
                        {[...Array(product.countInStock).keys()].map(
                          (x) => (
                            <option key={x + 1} value={x + 1}>
                              {x + 1}
                            </option>
                          )
                        )}
                      </Form.Control>
                    </div>
                  )}

                  {/* Add to Cart Button */}
                  <Button
                    className='add-to-cart-btn'
                    type='button'
                    disabled={product.countInStock === 0}
                    onClick={addToCartHandler}
                  >
                    <span className='btn-icon'>🛒</span> Add To Cart
                  </Button>

                  {/* Out of Stock Message */}
                  {product.countInStock === 0 && (
                    <Message variant='warning' className='out-of-stock-msg'>
                      This product is currently out of stock.
                    </Message>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Reviews Section - Centered Below */}
          <Row className='review-section'>
            <Col lg={8} className='mx-auto'>
              <h2 className='reviews-title'>📝 Reviews</h2>
              
              {product.reviews.length === 0 ? (
                <Message>No Reviews Yet</Message>
              ) : (
                <ListGroup variant='flush' className='reviews-list'>
                  {product.reviews.map((review) => (
                    <ListGroup.Item key={review._id} className='review-item'>
                      <div className='review-header'>
                        <strong className='review-name'>{review.name}</strong>
                        <span className='review-date'>{review.createdAt.substring(0, 10)}</span>
                      </div>
                      <Rating value={review.rating} />
                      <p className='review-comment'>{review.comment}</p>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}

              {/* Write Review Section */}
              <div className='write-review-section mt-5'>
                <h3 className='write-review-title'>✍ Write a Review</h3>

                {loadingProductReview && <Loader />}

                {userInfo ? (
                  <Form onSubmit={submitHandler} className='review-form'>
                    <Form.Group className='my-3' controlId='rating'>
                      <Form.Label>Rating</Form.Label>
                      <Form.Control
                        as='select'
                        required
                        value={rating}
                        onChange={(e) => setRating(e.target.value)}
                        className='form-control-styled'
                      >
                        <option value=''>Select...</option>
                        <option value='1'>1 - Poor</option>
                        <option value='2'>2 - Fair</option>
                        <option value='3'>3 - Good</option>
                        <option value='4'>4 - Very Good</option>
                        <option value='5'>5 - Excellent</option>
                      </Form.Control>
                    </Form.Group>
                    <Form.Group className='my-3' controlId='comment'>
                      <Form.Label>Comment</Form.Label>
                      <Form.Control
                        as='textarea'
                        rows='4'
                        required
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        className='form-control-styled'
                        placeholder='Write your review here...'
                      ></Form.Control>
                    </Form.Group>
                    <Button
                      disabled={loadingProductReview}
                      type='submit'
                      className='submit-review-btn'
                    >
                      Submit Review
                    </Button>
                  </Form>
                ) : (
                  <Message>
                    Please <Link to='/login' className='link-primary'>sign in</Link> to write a review
                  </Message>
                )}
              </div>
            </Col>
          </Row>
        </>
      )}
    </>
  );
};

export default ProductScreen;
