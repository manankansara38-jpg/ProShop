import { useState, useEffect } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { useValidateCouponMutation } from '../slices/couponsApiSlice.js';

const CouponInput = ({ orderTotal, onCouponApply }) => {
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [validateCoupon, { isLoading }] = useValidateCouponMutation();

  const handleApplyCoupon = async (e) => {
    e.preventDefault();

    if (!couponCode || couponCode.trim() === '') {
      toast.error('Please enter a coupon code');
      return;
    }

    try {
      const result = await validateCoupon({
        code: couponCode,
        orderTotal: parseFloat(orderTotal),
      }).unwrap();

      setAppliedCoupon(result.coupon);
      onCouponApply(result.coupon);
      toast.success(`✅ Coupon ${result.coupon.code} applied! Discount: ₹${result.coupon.discountAmount.toFixed(2)}`);
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to apply coupon');
      setAppliedCoupon(null);
      onCouponApply(null);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponCode('');
    setAppliedCoupon(null);
    onCouponApply(null);
    toast.info('Coupon removed');
  };

  // Listen for external programmatic input changes (e.g. from AvailableCoupons)
  // Re-attach listener after form re-mounts (when appliedCoupon changes)
  useEffect(() => {
    const el = document.getElementById('coupon-input');
    if (!el) return;
    const handler = () => {
      // sync native input value into React state
      setCouponCode(el.value.toUpperCase());
    };
    el.addEventListener('input', handler);
    return () => el.removeEventListener('input', handler);
  }, [appliedCoupon]); // Re-run when form is shown/hidden

  return (
    <div className='mb-3'>
      {!appliedCoupon ? (
        <Form onSubmit={handleApplyCoupon}>
          <Form.Group className='mb-2'>
            <Form.Label>Have a coupon code?</Form.Label>
            <div className='d-flex gap-2'>
              <Form.Control
                id='coupon-input'
                type='text'
                placeholder='Enter coupon code'
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                disabled={isLoading}
                className='coupon-input'
              />
              <Button
                type='submit'
                variant='primary'
                disabled={isLoading || !couponCode}
                className='px-4'
              >
                {isLoading ? 'Applying...' : 'Apply'}
              </Button>
            </div>
          </Form.Group>
        </Form>
      ) : (
        <Alert variant='success' className='d-flex justify-content-between align-items-center'>
          <div>
            <strong>Coupon Applied!</strong>
            <br />
            <small>Code: {appliedCoupon.code}</small>
          </div>
          <Button
            variant='outline-danger'
            size='sm'
            onClick={handleRemoveCoupon}
          >
            Remove
          </Button>
        </Alert>
      )}
    </div>
  );
};

export default CouponInput;
