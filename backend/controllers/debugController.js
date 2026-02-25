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
