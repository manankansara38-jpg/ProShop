import asyncHandler from '../middleware/asyncHandler.js';
import generateToken from '../utils/generateToken.js';
import sendEmail from '../utils/sendEmail.js';
import crypto from 'crypto';
import User from '../models/userModel.js';
import Coupon from '../models/couponModel.js';

// @desc    OAuth Google/Facebook callback - Create or login user
// @route   POST /api/oauth/callback
// @access  Public
const oauthCallback = asyncHandler(async (req, res) => {
  const { email, name, id } = req.body;

  if (!email || !name) {
    res.status(400);
    throw new Error('Email and name are required');
  }

  try {
    // Check if user exists
    let user = await User.findOne({ email });

    if (user) {
      // User exists, log them in
      generateToken(res, user._id);
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
      });
    } else {
      // Create new user with OAuth provider ID as a temporary password
      user = await User.create({
        name,
        email,
        password: `oauth_${id}_${Date.now()}`, // Temporary password
        isOAuthUser: true,
      });

      // Create welcome coupon and send welcome email (non-blocking)
      try {
        const randomCode = crypto.randomBytes(4).toString('hex').toUpperCase();
        const welcomeCoupon = await Coupon.create({
          code: `WELCOME${randomCode}`,
          discountValue: 20,
          couponType: 'welcome',
          isActive: true,
          description: 'Welcome coupon for new users',
          assignedTo: [user._id],
        });

        const welcomeHtml = `
          <h2>Welcome to ProShop! 🎉</h2>
          <p>Hi ${user.name || ''},</p>
          <p>Thank you for signing in with Google. We've created an account for you.</p>
          <h3>Your Welcome Offer</h3>
          <p>Use coupon code: <strong>${welcomeCoupon.code}</strong> to get 20% off on your first order.</p>
          <p><a href="${process.env.FRONTEND_URL}">Start shopping on ProShop</a></p>
          <p>If you didn't sign up, please contact our support.</p>
        `;

        sendEmail({ to: user.email, subject: 'Welcome to ProShop - Your Exclusive 20% Coupon!', html: welcomeHtml })
          .then(() => console.log('Welcome coupon email sent to:', user.email))
          .catch((e) => console.error('Welcome email failed:', e.message || e));
      } catch (emailErr) {
        console.error('Error creating/sending welcome coupon email:', emailErr.message || emailErr);
      }

      generateToken(res, user._id);
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
      });
    }
  } catch (error) {
    res.status(400);
    throw new Error(error.message || 'OAuth authentication failed');
  }
});

// @desc    Send magic link for email auth
// @route   POST /api/oauth/send-magic-link
// @access  Public
const sendMagicLink = asyncHandler(async (req, res) => {
  const { email } = req.body;

  console.log('/api/oauth/send-magic-link headers:', req.headers);
  console.log('/api/oauth/send-magic-link body:', req.body);

  if (!email) {
    console.warn('sendMagicLink: missing email in request body');
    return res.status(400).json({ message: 'Email is required' });
  }

  try {
    // Generate a token that expires in 15 minutes
    const token = require('crypto').randomBytes(32).toString('hex');
    const hashedToken = require('crypto')
      .createHash('sha256')
      .update(token)
      .digest('hex');
    const expireTime = Date.now() + 15 * 60 * 1000; // 15 minutes

    // Store the hashed token and expiry time in a temporary collection or cache
    // For now, we'll send the token directly via email
    const magicLink = `${process.env.FRONTEND_URL}/magic-login?token=${token}&email=${encodeURIComponent(email)}`;

    // In production, send via email
    console.log('Magic Link:', magicLink);

    res.json({
      message: 'Magic link sent to email (check console in development)',
      link: process.env.NODE_ENV === 'development' ? magicLink : undefined,
    });
  } catch (error) {
    console.error('sendMagicLink error:', error);
    return res.status(500).json({ message: 'Failed to send magic link', error: error.message });
  }
});

// @desc    Verify magic link and login user
// @route   POST /api/oauth/verify-magic-link
// @access  Public
const verifyMagicLink = asyncHandler(async (req, res) => {
  const { email, token } = req.body;

  if (!email || !token) {
    res.status(400);
    throw new Error('Email and token are required');
  }

  try {
    // For development, we'll simplify this
    // In production, you should verify the token properly
    let user = await User.findOne({ email });

    if (!user) {
      // Create new user with magic link
      user = await User.create({
        name: email.split('@')[0], // Use email prefix as name
        email,
        password: `magiclink_${token}_${Date.now()}`, // Temporary password
        isOAuthUser: true,
      });
    }

    generateToken(res, user._id);
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
    });
  } catch (error) {
    res.status(400);
    throw new Error('Magic link verification failed');
  }
});

export { oauthCallback, sendMagicLink, verifyMagicLink };
