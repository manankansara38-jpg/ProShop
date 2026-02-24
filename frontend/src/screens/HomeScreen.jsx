import { Container } from 'react-bootstrap';
import { useParams, useSearchParams } from 'react-router-dom';
import { useGetLatestProductsQuery, useGetHotProductsQuery, useGetProductsByCategoryQuery, useGetProductsQuery } from '../slices/productsApiSlice';
import { Link } from 'react-router-dom';
import Product from '../components/Product';
import Loader from '../components/Loader';
import Message from '../components/Message';
import ProductCarousel from '../components/ProductCarousel';
import Meta from '../components/Meta';

const HomeScreen = () => {
  const { category, keyword } = useParams();
  const [searchParams] = useSearchParams();
  const subcategory = searchParams.get('subcategory');

  const { data: latestData, isLoading: latestLoading } = useGetLatestProductsQuery();
  const { data: hotData, isLoading: hotLoading } = useGetHotProductsQuery();
  const { data: categoryData, isLoading: categoryLoading } = useGetProductsByCategoryQuery(
    { category, subcategory },
    { skip: !category }
  );
  const { data: searchData, isLoading: searchLoading } = useGetProductsQuery(
    { keyword, getAll: true },
    { skip: !keyword }
  );

  // If searching, show search results
  if (keyword) {
    return (
      <>
        <Link to='/' className='btn btn-light mb-4'>
          ← Back to Home
        </Link>
        <h1>Search Results for "{keyword}"</h1>
        {searchLoading ? (
          <Loader />
        ) : searchData && searchData.products && searchData.products.length > 0 ? (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', margin: '-0.75rem' }}>
            {searchData.products.map((product) => (
              <div key={product._id} style={{ flex: '0 0 calc(25% - 1.5rem)', maxWidth: 'calc(25% - 1.5rem)', padding: '0.75rem' }}>
                <Product product={product} />
              </div>
            ))}
          </div>
        ) : (
          <Message>No products found matching "{keyword}"</Message>
        )}
      </>
    );
  }

  // If viewing a category, show category products instead of all products
  if (category) {
    return (
      <>
        <Link to='/' className='btn btn-light mb-4'>
          ← Back to Home
        </Link>
        <h1>{subcategory ? `${category} - ${subcategory.charAt(0).toUpperCase() + subcategory.slice(1)}` : category}</h1>
        {categoryLoading ? (
          <Loader />
        ) : categoryData && categoryData.length > 0 ? (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', margin: '-0.75rem' }}>
            {categoryData.map((product) => (
              <div key={product._id} style={{ flex: '0 0 calc(25% - 1.5rem)', maxWidth: 'calc(25% - 1.5rem)', padding: '0.75rem' }}>
                <Product product={product} />
              </div>
            ))}
          </div>
        ) : (
          <Message>No products found in this category</Message>
        )}
      </>
    );
  }

  return (
    <>
      <Meta />
      <ProductCarousel />

      {/* LATEST PRODUCTS SECTION */}
      <Container className='py-5'>
        <div className='mb-6'>
          <h2 className='mb-4 section-title' style={{ paddingBottom: '15px' }}>📦 Latest Products</h2>
          {latestLoading ? (
            <Loader />
          ) : latestData && latestData.length > 0 ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', margin: '-0.75rem' }}>
              {latestData.map((product) => (
                <div key={product._id} style={{ flex: '0 0 calc(25% - 1.5rem)', maxWidth: 'calc(25% - 1.5rem)', padding: '0.75rem' }}>
                  <div className='product-card h-100'>
                    <Product product={product} />
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>

        {/* VISUAL SEPARATOR */}
        <div style={{
          margin: '5rem 0',
          height: '2px',
          background: 'linear-gradient(90deg, transparent, #ff6b35, transparent)',
          opacity: '0.3'
        }} />

        {/* HOT PRODUCTS SECTION */}
        <div className='mb-5'>
          <h2 className='mb-4 section-title' style={{ paddingBottom: '15px' }}>🔥 Most Demanded Products</h2>
          {hotLoading ? (
            <Loader />
          ) : hotData && hotData.length > 0 ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', margin: '-0.75rem' }}>
              {hotData.map((product) => (
                <div key={product._id} style={{ flex: '0 0 calc(25% - 1.5rem)', maxWidth: 'calc(25% - 1.5rem)', padding: '0.75rem' }}>
                  <div className='product-card h-100'>
                    <Product product={product} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Message>No hot products available</Message>
          )}
        </div>
      </Container>
    </>
  );
};

export default HomeScreen;
