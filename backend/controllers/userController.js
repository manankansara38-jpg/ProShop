import asyncHandler from '../middleware/asyncHandler.js';
import generateToken from '../utils/generateToken.js';
import crypto from 'crypto';
import sendEmail from '../utils/sendEmail.js';
import User from '../models/userModel.js';
import Coupon from '../models/couponModel.js';

// @desc    Auth user & get token
// @route   POST /api/users/auth
// @access  Public
const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    generateToken(res, user._id);

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

// @desc    Register a new user
// @route   POST /api/users
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  const user = await User.create({
    name,
    email,
    password,
  });

  if (user) {
    generateToken(res, user._id);

    // Send welcome coupon email
    try {
      // Create a unique welcome coupon for this user
      const randomCode = crypto.randomBytes(4).toString('hex').toUpperCase();
      const welcomeCoupon = await Coupon.create({
        code: `WELCOME${randomCode}`,
        discountValue: 20,
        couponType: 'welcome',
        isActive: true,
        description: 'Welcome coupon for new users',
        assignedTo: [user._id], // Assign only to this user
      });

      const welcomeHtml = `
        <h2>Welcome to ProShop! 🎉</h2>
        <p>Hi ${user.name},</p>
        <p>Thank you for registering with us! We're excited to have you as part of our community.</p>
        
        <h3>Exclusive Welcome Offer</h3>
        <p>As a token of our appreciation, we're giving you a <strong>20% discount</strong> on your first order!</p>
        <p><strong>Use coupon code: ${welcomeCoupon.code}</strong></p>
        
        <p style="color: #666; font-size: 14px;">This coupon can be used on orders with no minimum purchase requirement.</p>
        
        <p>Happy shopping!</p>
        <p>Best regards,<br>The ProShop Team</p>
      `;

      await sendEmail({
        to: user.email,
        subject: 'Welcome to ProShop - Your Exclusive 20% Discount Code Inside! 🎉',
        html: welcomeHtml,
      });
      console.log('Welcome coupon email sent to:', user.email);
    } catch (emailErr) {
      console.error('Error sending welcome coupon email:', emailErr);
      // Don't fail user registration if email fails
    }

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

// @desc    Logout user / clear cookie
// @route   POST /api/users/logout
// @access  Public
const logoutUser = (req, res) => {
  res.clearCookie('jwt');
  res.status(200).json({ message: 'Logged out successfully' });
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;

    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      isAdmin: updatedUser.isAdmin,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({});
  res.json(users);
});

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    if (user.isAdmin) {
      res.status(400);
      throw new Error('Can not delete admin user');
    }
    await User.deleteOne({ _id: user._id });
    res.json({ message: 'User removed' });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private/Admin
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');

  if (user) {
    res.json(user);
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});
// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.isAdmin = Boolean(req.body.isAdmin);

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      isAdmin: updatedUser.isAdmin,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

export {
  authUser,
  registerUser,
  logoutUser,
  getUserProfile,
  updateUserProfile,
  getUsers,
  deleteUser,
  getUserById,
  updateUser,
  forgotPassword,
  resetPassword,
};

// @desc    Forgot password - generate reset token and send link
// @route   POST /api/users/forgot
// @access  Public
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  console.log('Forgot password request received for:', email);
  const user = await User.findOne({ email });

  // Don't reveal whether email exists
  if (!user) {
    console.log('No user found with email:', email);
    res.status(404);
    throw new Error('User with this email not found');
  }

  // generate token and store hashed version
  const resetToken = crypto.randomBytes(20).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

  user.resetPasswordToken = hashedToken;
  user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour

  await user.save();

  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const resetUrl = `${frontendUrl}/password/reset/${resetToken}`;

  // Try to send email with reset link
  const message = `
    <p>You requested a password reset.</p>
    <p>Click the link below to set a new password. This link expires in 1 hour.</p>
    <p><a href="${resetUrl}">Reset Password</a></p>
    <p>If you did not request this, please ignore this email.</p>
  `;

  try {
    console.log('Sending reset email to:', email);
    const info = await sendEmail({
      to: email,
      subject: 'Password Reset Request',
      html: message,
    });
    console.log('Reset email send result:', info && info.messageId ? info.messageId : info);
  } catch (err) {
    console.error('Error sending reset email:', err);
  }

  res.json({ message: 'If that email exists, a reset link has been sent' });
});

// @desc    Reset password using token
// @route   POST /api/users/reset/:token
// @access  Public
const resetPassword = asyncHandler(async (req, res) => {
  const token = req.params.token;
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) {
    res.status(400);
    throw new Error('Invalid or expired password reset token');
  }

  const { password } = req.body;
  if (!password) {
    res.status(400);
    throw new Error('Password is required');
  }

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;

  await user.save();

  // Optionally, log the user in by issuing a new token cookie
  generateToken(res, user._id);

  res.json({ message: 'Password has been reset successfully' });
});
