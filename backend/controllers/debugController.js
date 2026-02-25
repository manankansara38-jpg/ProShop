import asyncHandler from '../middleware/asyncHandler.js';

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

  // Try an HTTP request to SendGrid to validate network + key
  try {
    const resp = await fetch('https://api.sendgrid.com/v3/user/account', {
      method: 'GET',
      headers: { Authorization: `Bearer ${process.env.SENDGRID_API_KEY}` },
      // keep short timeout by relying on platform request timeout
    });

    const text = await resp.text();
    let body;
    try {
      body = JSON.parse(text);
    } catch (e) {
      body = text;
    }

    result.sendgrid.status = resp.status;
    // Avoid returning huge responses; truncate strings
    if (typeof body === 'string') result.sendgrid.body = body.slice(0, 200);
    else result.sendgrid.body = body;

    return res.json(result);
  } catch (err) {
    result.sendgrid.error = err.message;
    return res.status(502).json(result);
  }
});

export { checkSendGrid };
