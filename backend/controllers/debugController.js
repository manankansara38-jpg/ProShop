import asyncHandler from '../middleware/asyncHandler.js';
import https from 'https';

// GET /api/debug/sendgrid
// Returns whether SENDGRID_API_KEY and SENDGRID_FROM_EMAIL are present
// and attempts a simple GET to the SendGrid API to check reachability.
const checkSendGrid = asyncHandler(async (req, res) => {
  const hasKey = !!process.env.SENDGRID_API_KEY;
  const from = process.env.SENDGRID_FROM_EMAIL || null;

  const result = {
    sendgrid: {
      present: hasKey,
      from,
    },
  };

  if (!hasKey) {
    return res.json({ ...result, message: 'SENDGRID_API_KEY not set on server' });
  }

  // Use native https to avoid relying on global fetch
  try {
    const sgResp = await new Promise((resolve, reject) => {
      const options = {
        method: 'GET',
        headers: { Authorization: `Bearer ${process.env.SENDGRID_API_KEY}` },
      };

      const req = https.request('https://api.sendgrid.com/v3/user/account', options, (r) => {
        let data = '';
        r.on('data', (chunk) => (data += chunk));
        r.on('end', () => resolve({ statusCode: r.statusCode, body: data }));
      });

      req.on('error', (e) => reject(e));
      req.setTimeout(5000, () => {
        req.destroy(new Error('request timeout'));
      });
      req.end();
    });

    let body;
    try {
      body = JSON.parse(sgResp.body);
    } catch (e) {
      body = typeof sgResp.body === 'string' ? sgResp.body.slice(0, 200) : sgResp.body;
    }

    result.sendgrid.status = sgResp.statusCode;
    result.sendgrid.body = body;

    return res.json(result);
  } catch (err) {
    result.sendgrid.error = err.message;
    return res.status(502).json(result);
  }
});

export { checkSendGrid };

// POST /api/debug/send-email
// Protected by header 'x-debug-key' matching env DEBUG_TRIGGER_KEY
const sendTestEmail = asyncHandler(async (req, res) => {
  const secret = process.env.DEBUG_TRIGGER_KEY;
  const header = req.headers['x-debug-key'];

  if (!secret) {
    return res.status(403).json({ error: 'Debug trigger not configured on server' });
  }

  if (!header || header !== secret) {
    return res.status(403).json({ error: 'Invalid debug key' });
  }

  const to = req.body && req.body.to ? req.body.to : null;
  if (!to) return res.status(400).json({ error: 'Missing "to" in JSON body' });

  // Lazy import to avoid unnecessary module loads
  const sendEmail = (await import('../utils/sendEmail.js')).default;

  const subject = 'ProShop - Test Email';
  const html = `<p>This is a test email from your ProShop deployment to <strong>${to}</strong>.</p>`;

  const result = await sendEmail({ to, subject, html });
  return res.json({ result });
});

export { checkSendGrid, sendTestEmail };
