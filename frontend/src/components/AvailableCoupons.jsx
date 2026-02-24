import { Col, Card, ListGroup, Badge } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { useGetUserCouponsQuery, useGetActiveCouponsQuery } from '../slices/couponsApiSlice.js';
import Loader from './Loader.jsx';
import Message from './Message.jsx';

const AvailableCoupons = ({ onCouponSelect }) => {
  const { userInfo } = useSelector((state) => state.auth);
  
  // Use protected endpoint for logged-in users to get their user-specific coupons
  const { data: userCoupons, isLoading: userLoading, error: userError } = useGetUserCouponsQuery(
    undefined,
    { skip: !userInfo } // Skip query if user not logged in
  );
  
  // For non-logged-in users, fetch public coupons
  const { data: activeCoupons, isLoading: activeLoading, error: activeError } = useGetActiveCouponsQuery(
    undefined,
    { skip: !!userInfo } // Skip if user is logged in (use user coupons instead)
  );

  const isLoading = userLoading || activeLoading;
  const error = userError || activeError;
  // Show user coupons if logged in, otherwise show public coupons
  const coupons = userInfo ? (userCoupons || []) : (activeCoupons || []);

  // Debug logs to help diagnose why coupons may be empty
  try {
    console.log('AvailableCoupons debug:', {
      userInfo,
      activeCoupons,
      userCoupons,
      mergedCount: coupons ? coupons.length : 0,
      userLoading,
      activeLoading,
      userError,
      activeError,
    });
  } catch (e) {}

  if (isLoading) return <Loader />;
  if (error) return null; // Silently fail, don't show error

  const displayCoupons = coupons?.filter((coupon) => {
    // Treat undefined isActive as active (some API endpoints return a subset of fields)
    const isActive = coupon.isActive !== false;
    const notExpired = !coupon.expiryDate || new Date(coupon.expiryDate) > new Date();
    return isActive && notExpired;
  })
  ?.sort((a, b) => {
    // Sort by creation date - newest first
    return new Date(b.createdAt) - new Date(a.createdAt);
  }) || [];

  return (
    <Col md={12} className='mb-3'>
      {displayCoupons.length > 0 ? (
        <>
          <h5 className='mb-3'>
            <Badge bg='success'>
              {displayCoupons.length} Available Coupon{displayCoupons.length !== 1 ? 's' : ''}
            </Badge>
          </h5>
          <div className='available-coupons-list'>
            <div className='d-grid gap-2'>
            {displayCoupons.map((coupon) => (
              <Card key={coupon._id} className='coupon-card p-3'>
                <div className='d-flex justify-content-between align-items-center'>
                  <div>
                    <div className='fw-bold text-primary'>{coupon.code}</div>
                    <small className='text-muted'>
                      {coupon.couponType === 'welcome' && '🎉 Welcome Bonus'}
                      {coupon.couponType === 'promotion' && '📢 Promotion'}
                      {coupon.couponType === 'campaign' && '🎯 Campaign'}
                      {coupon.couponType === 'thankyou' && '🙏 Thank You Offer'}
                    </small>
                    {coupon.description && (
                      <div className='small text-secondary'>{coupon.description}</div>
                    )}
                    {coupon.createdAt && (
                      <div className='small text-muted mt-1'>
                        Received: {new Date(coupon.createdAt).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </div>
                    )}
                    {coupon.expiryDate && (
                      <div className='small text-warning'>
                        ⏰ Expires: {new Date(coupon.expiryDate).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </div>
                    )}
                  </div>
                  <div className='text-end'>
                    <div className='fs-5 fw-bold text-success'>
                      {coupon.discountType === 'percentage'
                        ? `${coupon.discountValue}% OFF`
                        : `₹${coupon.discountValue} OFF`}
                    </div>
                    <button
                      className='btn btn-sm btn-outline-primary mt-2'
                      onClick={() => onCouponSelect && onCouponSelect(coupon.code)}
                    >
                      Use Code
                    </button>
                  </div>
                </div>
              </Card>
            ))}
            </div>
          </div>
        </>
      ) : (
        <Message variant='info'>No available coupons at this time</Message>
      )}
    </Col>
  );
};

export default AvailableCoupons;
