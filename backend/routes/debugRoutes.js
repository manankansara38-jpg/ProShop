import express from 'express';
import { checkSendGrid, sendTestEmail } from '../controllers/debugController.js';

const router = express.Router();

// Check SendGrid presence and reachability
router.get('/sendgrid', checkSendGrid);

// Trigger a test email from the live server
// Body: { "to": "you@domain.com" }
// Header: x-debug-key: <DEBUG_TRIGGER_KEY>
router.post('/send-email', express.json(), sendTestEmail);

export default router;
