import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      unique: true,
      required: true,
      uppercase: true,
      trim: true,
    },
    discountValue: {
      type: Number,
      required: true,
      default: 20, // 20% discount
    },
    discountType: {
      type: String,
      enum: ['percentage', 'fixed'],
      default: 'percentage',
    },
    minOrderValue: {
      type: Number,
      default: 0,
    },
    maxUsage: {
      type: Number,
      default: null, // null = unlimited
    },
    usageCount: {
      type: Number,
      default: 0,
    },
    expiryDate: {
      type: Date,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    couponType: {
      type: String,
      enum: ['welcome', 'promotion', 'campaign', 'thankyou'],
      default: 'promotion',
    },
    description: String,
    usedBy: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'User',
      default: [],
    },
    assignedTo: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'User',
      default: [],
      // If empty, coupon is available to all. If set, only these users can see/use it.
    },
  },
  { timestamps: true }
);

const Coupon = mongoose.model('Coupon', couponSchema);
export default Coupon;
