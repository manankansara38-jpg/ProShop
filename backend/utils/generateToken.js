import jwt from 'jsonwebtoken';

// Method 1: Generate token and set as cookie (original)
const generateToken = (res, userId) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });

  // Set JWT as an HTTP-Only cookie
  res.cookie('jwt', token, {
    httpOnly: true,
    // In production we need `SameSite=None` and `secure: true` for cross-site
    // cookie use (e.g., when frontend and backend are on different domains).
    // For development (CRA proxy or same-origin), use a more permissive value.
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });
};

// Method 2: Just create and return the token (without cookie)
export const createJWT = (userId, expiresIn = '30d') => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn,
  });
};

// Method 3: Verify token
export const verifyJWT = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
};

export default generateToken;
