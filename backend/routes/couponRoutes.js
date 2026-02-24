import express from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';
import {
  createCoupon,
  getActiveCoupons,
  validateCoupon,
  getUserCoupons,
  getAllCoupons,
  updateCoupon,
  deleteCoupon,
} from '../controllers/couponController.js';

const router = express.Router();

// More specific routes first
router.get('/active', getActiveCoupons);
router.post('/validate', protect, validateCoupon);
router.get('/user', protect, getUserCoupons);

// Admin routes
router.post('/', protect, admin, createCoupon);
router.get('/', protect, admin, getAllCoupons);
router.put('/:id', protect, admin, updateCoupon);
router.delete('/:id', protect, admin, deleteCoupon);

export default router;
