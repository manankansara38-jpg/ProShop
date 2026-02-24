import { Link } from 'react-router-dom';
import { Carousel } from 'react-bootstrap';

const ProductCarousel = () => {
  const banners = [
    {
      id: 1,
      title: 'Electronics & Gadgets',
      subtitle: 'Latest Technology',
      category: 'Electronics',
      image: '/uploads/image-1771674272715.png',
    },
    {
      id: 2,
      title: 'Fashion & Clothing',
      subtitle: 'Trendy Collection',
      category: 'Clothes',
      image: '/uploads/image-1771674410097.png',
    },
    {
      id: 3,
      title: 'Fresh Vegetables',
      subtitle: 'Organic & Healthy',
      category: 'Vegetables',
    
      image: '/uploads/image-1771586088878.png',
    },
    {
      id: 4,
      title: 'Medicine & Healthcare',
      subtitle: 'Your Health Matters',
      category: 'Medicine',
      image: '/uploads/image-1771586172674.png',
    }
  ];

  return (
    <div style={{ width: '100vw', marginLeft: 'calc(-50vw + 50%)', overflow: 'hidden', position: 'relative', marginBottom: '40px' }}>
      <Carousel pause='hover' className='mb-0'>
        {banners.map((banner) => (
          <Carousel.Item key={banner.id}>
            <div 
              style={{ 
                position: 'relative', 
                height: '700px', 
                width: '100%',
                backgroundImage: `url(${banner.image})`,
                backgroundSize: 'cover',
                backgroundColor: '#f5f5f5',
                backgroundPosition: 'center center',
                backgroundRepeat: 'no-repeat',
                backgroundAttachment: 'scroll',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden'
              }}
            >
              {/* Gradient Overlay - Darker for better text */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'linear-gradient(90deg, rgba(0, 0, 0, 0.6) 0%, rgba(0, 0, 0, 0.3) 50%, rgba(0, 0, 0, 0) 100%)',
                zIndex: 1
              }} />
              
              {/* Content */}
              <div style={{
                position: 'relative',
                zIndex: 2,
                padding: '60px 80px',
                color: 'white',
                maxWidth: '700px'
              }}>
                <h1 style={{ 
                  fontSize: '3.5rem', 
                  fontWeight: '800',
                  marginBottom: '15px',
                  textShadow: '2px 2px 8px rgba(0,0,0,0.8)',
                  letterSpacing: '0.5px',
                  lineHeight: '1.2'
                }}>
                  {banner.title}
                </h1>
                <p style={{ 
                  fontSize: '1.25rem', 
                  marginBottom: '30px',
                  textShadow: '1px 1px 4px rgba(0,0,0,0.8)',
                  fontWeight: '500',
                  opacity: '0.95'
                }}>
                  {banner.subtitle}
                </p>
                <Link to={`/category/${banner.category}`} style={{ textDecoration: 'none' }}>
                  <button style={{
                    backgroundColor: '#ff6b35',
                    color: 'white',
                    padding: '16px 48px',
                    fontSize: '1.15rem',
                    fontWeight: '700',
                    border: 'none',
                    borderRadius: '50px',
                    cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.23, 1, 0.320, 1)',
                    boxShadow: '0 8px 25px rgba(255, 107, 53, 0.4)',
                    letterSpacing: '0.5px'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#ff5722';
                    e.target.style.transform = 'translateY(-4px) scale(1.06)';
                    e.target.style.boxShadow = '0 14px 35px rgba(255, 87, 34, 0.6)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = '#ff6b35';
                    e.target.style.transform = 'translateY(0) scale(1)';
                    e.target.style.boxShadow = '0 8px 25px rgba(255, 107, 53, 0.4)';
                  }}
                  >
                    Shop Now →
                  </button>
                </Link>
              </div>
            </div>
          </Carousel.Item>
        ))}
      </Carousel>
    </div>
  );
};

export default ProductCarousel;
