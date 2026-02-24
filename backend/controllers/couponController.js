import asyncHandler from '../middleware/asyncHandler.js';
import Coupon from '../models/couponModel.js';
import sendEmail from '../utils/sendEmail.js';
import crypto from 'crypto';

// Helper function to generate unique coupon code
const generateCouponCode = (type) => {
  const prefixes = {
    welcome: 'WELCOME',
    promotion: 'PROMO',
    campaign: 'CAMP',
    thankyou: 'THANKYOU',
  };

  const prefix = prefixes[type] || 'COUP';
  const randomPart = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `${prefix}${randomPart}`;
};

// @desc    Create coupon (Admin)
// @route   POST /api/coupons
// @access  Private/Admin
const createCoupon = asyncHandler(async (req, res) => {
  const { code, discountValue, minOrderValue, maxUsage, expiryDate, couponType, description } = req.body;

  const coupon = await Coupon.create({
    code: code || generateCouponCode(couponType),
    discountValue: discountValue || 20,
    minOrderValue: minOrderValue || 0,
    maxUsage,
    expiryDate,
    couponType,
    description,
    isActive: true,
  });

  res.status(201).json(coupon);
});

// @desc    Get all active coupons (for homepage)
// @route   GET /api/coupons/active
// @access  Public
const getActiveCoupons = asyncHandler(async (req, res) => {
  // Return all active coupons (any type) that are not expired.
  const coupons = await Coupon.find({
    isActive: true,
    couponType: { $ne: 'thankyou' }, // Hide "thankyou" coupons from public active list
    $or: [
      { expiryDate: { $exists: false } },
      { expiryDate: null },
      { expiryDate: { $gt: new Date() } }
    ]
  })
  .select('code discountValue discountType description couponType expiryDate createdAt')
  .sort({ createdAt: -1 });  // Show recent coupons first

  res.json(coupons);
});

// @desc    Validate & Get Coupon
// @route   POST /api/coupons/validate
// @access  Private
const validateCoupon = asyncHandler(async (req, res) => {
  const { code, orderTotal } = req.body;
  const userId = req.user._id;

  if (!code) {
    res.status(400);
    throw new Error('Coupon code is required');
  }

  const couponCode = code.toUpperCase().trim();
  const coupon = await Coupon.findOne({ code: couponCode });

  console.log('🔍 COUPON VALIDATION:');
  console.log('  Code:', couponCode);
  console.log('  Found:', !!coupon);
  console.log('  UserId:', userId);
  console.log('  Coupon usedBy:', coupon?.usedBy || []);

  if (!coupon) {
    res.status(404);
    throw new Error('Coupon not found');
  }

  if (!coupon.isActive) {
    res.status(400);
    throw new Error('Coupon is inactive');
  }

  // Check if coupon has expired
  if (coupon.expiryDate && new Date() > coupon.expiryDate) {
    res.status(400);
    throw new Error('Coupon has expired');
  }

  // Check if user has already used this coupon
  if (coupon.usedBy && Array.isArray(coupon.usedBy) && coupon.usedBy.length > 0) {
    const userHasUsed = coupon.usedBy.some(id => {
      const idStr = id.toString();
      const userStr = userId.toString();
      console.log(`  Comparing ${idStr} === ${userStr}: ${idStr === userStr}`);
      return idStr === userStr;
    });

    if (userHasUsed) {
      console.log('  ❌ User has already used this coupon!');
      res.status(400);
      throw new Error('❌ You have already used this coupon. Each coupon can only be used once.');
    }
  }

  if (coupon.maxUsage && coupon.usageCount >= coupon.maxUsage) {
    res.status(400);
    throw new Error('Coupon usage limit exceeded');
  }

  if (orderTotal < coupon.minOrderValue) {
    res.status(400);
    throw new Error(`Minimum order ₹${coupon.minOrderValue} required to use this coupon`);
  }

  // Calculate discount
  let discountAmount = 0;
  if (coupon.discountType === 'percentage') {
    discountAmount = (orderTotal * coupon.discountValue) / 100;
  } else {
    discountAmount = coupon.discountValue;
  }

  console.log('  ✅ Coupon is valid!');

  res.json({
    valid: true,
    coupon: {
      _id: coupon._id,
      code: coupon.code,
      discountValue: coupon.discountValue,
      discountType: coupon.discountType,
      discountAmount,
    },
  });
});

// @desc    Get user's available coupons
// @route   GET /api/coupons/user
// @access  Private
const getUserCoupons = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  console.log('📋 FETCHING USER COUPONS:');
  console.log('  UserId:', userId);

  // Show ONLY coupons:
  // 1. Assigned SPECIFICALLY to this user (assignedTo array must contain this user)
  // 2. User is NOT in usedBy array
  // 3. Coupon is active
  // 4. Coupon is not expired
  const activeCoupons = await Coupon.find({
    isActive: true,
    assignedTo: userId,                   // MUST be assigned specifically to this user
    usedBy: { $ne: userId },              // User must NOT be in usedBy array
    $or: [                                // Not expired
      { expiryDate: { $exists: false } },
      { expiryDate: null },
      { expiryDate: { $gt: new Date() } }
    ]
  })
  .sort({ createdAt: -1 })                // Show recent coupons first
  .select('code discountValue discountType description couponType expiryDate createdAt isActive minOrderValue _id');

  console.log('  Active unused coupons:', activeCoupons.length);
  activeCoupons.forEach((c, i) => {
    console.log(`    ${i + 1}. ${c.code} (${c.couponType}) - Created: ${c.createdAt}`);
  });

  res.json(activeCoupons);
});

// @desc    Get all coupons (Admin)
// @route   GET /api/coupons
// @access  Private/Admin
const getAllCoupons = asyncHandler(async (req, res) => {
  const coupons = await Coupon.find({}).sort({ createdAt: -1 });
  res.json(coupons);
});

// @desc    Update coupon (Admin)
// @route   PUT /api/coupons/:id
// @access  Private/Admin
const updateCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);

  if (!coupon) {
    res.status(404);
    throw new Error('Coupon not found');
  }

  coupon.discountValue = req.body.discountValue || coupon.discountValue;
  coupon.minOrderValue = req.body.minOrderValue || coupon.minOrderValue;
  coupon.maxUsage = req.body.maxUsage || coupon.maxUsage;
  coupon.expiryDate = req.body.expiryDate || coupon.expiryDate;
  coupon.isActive = req.body.isActive !== undefined ? req.body.isActive : coupon.isActive;
  coupon.description = req.body.description || coupon.description;

  await coupon.save();
  res.json(coupon);
});

// @desc    Delete coupon (Admin)
// @route   DELETE /api/coupons/:id
// @access  Private/Admin
const deleteCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findByIdAndDelete(req.params.id);

  if (!coupon) {
    res.status(404);
    throw new Error('Coupon not found');
  }

  res.json({ message: 'Coupon deleted' });
});

export {
  createCoupon,
  getActiveCoupons,
  validateCoupon,
  getUserCoupons,
  getAllCoupons,
  updateCoupon,
  deleteCoupon,
  generateCouponCode,
};
