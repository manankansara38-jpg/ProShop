import express from 'express';
import { checkSendGrid } from '../controllers/debugController.js';

const router = express.Router();

// Check SendGrid presence and reachability
router.get('/sendgrid', checkSendGrid);

export default router;
