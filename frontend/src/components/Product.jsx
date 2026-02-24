import { Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import Rating from './Rating';

const Product = ({ product }) => {
  return (
    <Card className='my-3 p-3 rounded product-card'>
      <div style={{ position: 'relative', overflow: 'hidden', borderRadius: '8px', height: '240px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8f8f8' }}>
        {product.discountPrice && product.discountPrice < product.price && (
          (() => {
            const perc = Math.round(((product.price - product.discountPrice) / product.price) * 100);
            return (
              <div className='discount-badge'>-{perc}%</div>
            );
          })()
        )}
        <Link to={`/product/${product._id}`} style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Card.Img 
            src={product.image} 
            variant='top'
            style={{ height: '100%', width: '100%', objectFit: 'contain', padding: '8px', boxSizing: 'border-box' }}
          />
        </Link>
      </div>

      <Card.Body style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '12px' }}>
        <Link to={`/product/${product._id}`} style={{ textDecoration: 'none' }}>
          <Card.Text style={{ fontSize: '0.75rem', color: '#ff6b35', marginBottom: '8px', fontWeight: '700', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
            {product.brand}
          </Card.Text>
          <Card.Title as='div' className='product-title'>
            <strong style={{ color: '#222', fontSize: '0.95rem', lineHeight: '1.4' }}>{product.name}</strong>
          </Card.Title>
        </Link>

        <div style={{ marginTop: 'auto' }}>
          <Card.Text as='div' style={{ marginBottom: '8px' }}>
            <Rating
              value={product.rating}
              text={product.numReviews > 0 ? `${product.numReviews} reviews` : ''}
            />
          </Card.Text>

          {product.discountPrice && product.discountPrice < product.price ? (
            <div>
              <div style={{ fontSize: '0.9rem', color: '#888', textDecoration: 'line-through' }}>
                ₹{product.price}
              </div>
              <Card.Text as='h3' style={{ fontSize: '1.3rem', fontWeight: '700', color: '#ff6b35', margin: 0 }}>
                ₹{product.discountPrice}
              </Card.Text>
            </div>
          ) : (
            <Card.Text as='h3' style={{ fontSize: '1.3rem', fontWeight: '700', color: '#ff6b35', margin: 0 }}>
              ₹{product.price}
            </Card.Text>
          )}
        </div>
      </Card.Body>
    </Card>
  );
};

export default Product;
