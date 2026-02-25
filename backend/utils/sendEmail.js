import nodemailer from 'nodemailer';

const sendEmail = async ({ to, subject, html }) => {
  console.log('\n📧 ================================');
  console.log('📧 EMAIL SEND REQUESTED');
  console.log('📧 ================================');
  console.log('📧 To:', to);
  console.log('📧 Subject:', subject);
  console.log('📧 DEBUG: NODE_ENV=', process.env.NODE_ENV || 'not set');
  console.log('📧 DEBUG: SENDGRID_API_KEY present?', !!process.env.SENDGRID_API_KEY);
  // Do not print full API key; show prefix to help detect truncation
  console.log('📧 DEBUG: SENDGRID_API_KEY prefix:', process.env.SENDGRID_API_KEY ? process.env.SENDGRID_API_KEY.slice(0, 8) : 'NOT SET');
  console.log('📧 DEBUG: SENDGRID_FROM_EMAIL=', process.env.SENDGRID_FROM_EMAIL || 'NOT SET');

  // PRIORITY 1: If SendGrid API key is provided, use the Web API (works around blocked SMTP)
  if (process.env.SENDGRID_API_KEY) {
    try {
      console.log('📧 Attempting SendGrid Web API...');
      // Dynamic import to prevent load errors if package is missing
      const sgMailModule = await import('@sendgrid/mail');
      const sgMail = sgMailModule.default;
      
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);
      
      // SendGrid Web API requires from.email to be a valid email address
      // Use SENDGRID_FROM_EMAIL if set, otherwise fall back to noreplyshoppers173@gmail.com
      const fromEmail = process.env.SENDGRID_FROM_EMAIL || 'noreplyshoppers173@gmail.com';
      const fromName = process.env.SMTP_FROM || 'ProShop';
      console.log('📧 From Email:', fromEmail);
      console.log('📧 From Name:', fromName);
      
      const msg = {
        to,
        from: {
          email: fromEmail,
          name: fromName,
        },
        subject,
        html,
      };

      console.log('📧 Sending via SendGrid Web API...');
      const result = await sgMail.send(msg);
      console.log('✅ EMAIL SENT SUCCESSFULLY via SendGrid Web API');
      console.log('  Response:', result[0] && result[0].statusCode);
      console.log('📧 ================================\n');
      return { sent: true, via: 'sendgrid' };
    } catch (sgErr) {
      console.error('\n❌ ================================');
      console.error('❌ SENDGRID WEB API FAILED');
      console.error('❌ ================================');
      console.error('❌ Error:', sgErr && sgErr.message ? sgErr.message : sgErr);
      if (sgErr.response) {
        console.error('❌ Status:', sgErr.response.statusCode);
        console.error('❌ Body:', sgErr.response.body);
      }
      console.error('❌ Will try SMTP fallback...');
    }
  }

  // PRIORITY 2: Fallback to SMTP using nodemailer
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.error('❌ EMAIL CONFIG ERROR: missing SMTP config');
    return { error: 'Email service not configured', sent: false };
  }

  try {
    console.log('\n📧 ================================');
    console.log('📧 FALLBACK: Using SMTP');
    console.log('📧 ================================');
    console.log('📧 SMTP Config:');
    console.log('  Host:', process.env.SMTP_HOST);
    console.log('  Port:', process.env.SMTP_PORT || 587);
    console.log('  User:', process.env.SMTP_USER);
    console.log('  From:', process.env.SMTP_FROM || process.env.SMTP_USER);

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_PORT === '465',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      connectionTimeout: 8000,
      socketTimeout: 8000,
      logger: process.env.NODE_ENV === 'development' ? true : false,
      debug: process.env.NODE_ENV === 'development' ? true : false,
    });

    console.log('📧 Verifying SMTP connection...');
    try {
      await Promise.race([
        transporter.verify(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('SMTP verify timeout')), 5000)),
      ]);
      console.log('✅ SMTP connection verified');
    } catch (verifyErr) {
      console.warn('⚠️ SMTP verify failed:', verifyErr.message);
    }

    const rawFromAddress = process.env.SMTP_FROM || process.env.SMTP_USER;
    const from = `ProShop <${rawFromAddress}>`;

    console.log('📧 Sending email from:', from, 'to:', to);

    const info = await Promise.race([
      transporter.sendMail({ from, to, subject, html, replyTo: process.env.SMTP_USER }),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Email send timeout after 8s')), 8000)),
    ]);

    console.log('✅ EMAIL SENT SUCCESSFULLY via SMTP');
    console.log('  MessageID:', info && info.messageId);
    console.log('  Response:', info && info.response);
    console.log('📧 ================================\n');
    return { sent: true, via: 'smtp', messageId: info && info.messageId };
  } catch (error) {
    console.error('\n❌ ================================');
    console.error('❌ EMAIL SEND FAILED (BOTH SendGrid + SMTP)');
    console.error('❌ ================================');
    console.error('❌ Error:', error.message || error);
    console.error('❌ Code:', error.code);
    console.error('❌ To:', to);
    console.error('❌ Subject:', subject);
    console.error('❌ ================================\n');
    console.error('Full error:', error);
    return { error: error.message || error, sent: false };
  }
};

export default sendEmail;
