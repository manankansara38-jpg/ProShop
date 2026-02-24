import express from 'express';
import {
  oauthCallback,
  sendMagicLink,
  verifyMagicLink,
} from '../controllers/oauthController.js';

const router = express.Router();

// OAuth callback for Google and Facebook
router.post('/callback', oauthCallback);

// Email magic link routes
router.post('/send-magic-link', sendMagicLink);
router.post('/verify-magic-link', verifyMagicLink);

export default router;
