import { Link } from 'react-router-dom';
import { Carousel } from 'react-bootstrap';

const ProductCarousel = () => {
  const banners = [
    {
      id: 1,
      title: 'Electronics & Gadgets',
      subtitle: 'Latest Technology',
      category: 'Electronics',
      image: 'https://res.cloudinary.com/dgbhtbe9o/image/upload/v1771960671/proshop-banners/yhieeutyh3ltnyvbubol.png',
      mobileImage: 'https://res.cloudinary.com/dgbhtbe9o/image/upload/c_scale,w_400/v1771960671/proshop-banners/yhieeutyh3ltnyvbubol.png',
    },
    {
      id: 2,
      title: 'Fashion & Clothing',
      subtitle: 'Trendy Collection',
      category: 'Clothes',
      image: 'https://res.cloudinary.com/dgbhtbe9o/image/upload/v1771960672/proshop-banners/slbgwgkseq2kedcidcfd.png',
      mobileImage: 'https://res.cloudinary.com/dgbhtbe9o/image/upload/c_scale,w_400/v1771960672/proshop-banners/slbgwgkseq2kedcidcfd.png',
    },
    {
      id: 3,
      title: 'Fresh Vegetables',
      subtitle: 'Organic & Healthy',
      category: 'Vegetables',
      image: 'https://res.cloudinary.com/dgbhtbe9o/image/upload/v1771960673/proshop-banners/wulpuc83v7jwlzhr86hb.png',
      mobileImage: 'https://res.cloudinary.com/dgbhtbe9o/image/upload/c_scale,w_400/v1771960673/proshop-banners/wulpuc83v7jwlzhr86hb.png',
    },
    {
      id: 4,
      title: 'Medicine & Healthcare',
      subtitle: 'Your Health Matters',
      category: 'Medicine',
      image: 'https://res.cloudinary.com/dgbhtbe9o/image/upload/v1771960675/proshop-banners/bbtxp5tgfbeftuelij4p.png',
      mobileImage: 'https://res.cloudinary.com/dgbhtbe9o/image/upload/c_scale,w_400/v1771960675/proshop-banners/bbtxp5tgfbeftuelij4p.png',
    }
  ];

  // Detect if mobile
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  return (
    <div style={{ width: '100vw', marginLeft: 'calc(-50vw + 50%)', overflow: 'hidden', position: 'relative', marginBottom: '40px' }}>
      <Carousel pause='hover' className='mb-0' controls={false} interval={3000} ride='carousel'>
        {banners.map((banner) => (
          <Carousel.Item key={banner.id}>
            <div 
              style={{ 
                position: 'relative', 
                height: isMobile ? '300px' : '700px',
                width: '100%',
                backgroundImage: `url(${isMobile ? banner.mobileImage : banner.image})`,
                backgroundSize: 'cover',
                backgroundColor: '#f5f5f5',
                backgroundPosition: isMobile ? 'center top' : 'center center',
                backgroundRepeat: 'no-repeat',
                backgroundAttachment: 'scroll',
                display: 'flex',
                alignItems: 'center',
                justifyContent: isMobile ? 'flex-end' : 'center',
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
                background: isMobile 
                  ? 'linear-gradient(180deg, transparent 0%, rgba(0, 0, 0, 0.8) 100%)'
                  : 'linear-gradient(90deg, rgba(0, 0, 0, 0.6) 0%, rgba(0, 0, 0, 0.3) 50%, rgba(0, 0, 0, 0) 100%)',
                zIndex: 1
              }} />
              
              {/* Content */}
              <div style={{
                position: 'relative',
                zIndex: 2,
                padding: isMobile ? '20px 15px' : '60px 80px',
                color: 'white',
                maxWidth: isMobile ? '100%' : '700px',
                textAlign: isMobile ? 'center' : 'left',
                width: '100%'
              }}>
                <h1 style={{ 
                  fontSize: isMobile ? '1.3rem' : '3.5rem', 
                  fontWeight: '800',
                  marginBottom: isMobile ? '8px' : '15px',
                  textShadow: '2px 2px 8px rgba(0,0,0,0.8)',
                  letterSpacing: '0.5px',
                  lineHeight: '1.2'
                }}>
                  {banner.title}
                </h1>
                <p style={{ 
                  fontSize: isMobile ? '0.8rem' : '1.25rem', 
                  marginBottom: isMobile ? '12px' : '30px',
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
                    padding: isMobile ? '10px 20px' : '16px 48px',
                    fontSize: isMobile ? '0.85rem' : '1rem',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '700',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 12px rgba(255, 107, 53, 0.4)',
                    position: 'relative',
                    zIndex: 3,
                    display: 'inline-block',
                    visibility: 'visible'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#ff8c53';
                    e.target.style.boxShadow = '0 6px 16px rgba(255, 107, 53, 0.6)';
                    e.target.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = '#ff6b35';
                    e.target.style.boxShadow = '0 4px 12px rgba(255, 107, 53, 0.4)';
                    e.target.style.transform = 'translateY(0)';
                  }}>
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
