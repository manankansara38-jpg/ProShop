import nodemailer from 'nodemailer';

const sendEmail = async ({ to, subject, html }) => {
  console.log('\n📧 ================================');
  console.log('📧 EMAIL SEND REQUESTED');
  console.log('📧 ================================');
  console.log('📧 To:', to);
  console.log('📧 Subject:', subject);
  console.log('📧 DEBUG: NODE_ENV=', process.env.NODE_ENV || 'not set');
  console.log('📧 DEBUG: MAILGUN_API_KEY present?', !!process.env.MAILGUN_API_KEY);
  console.log('📧 DEBUG: MAILGUN_DOMAIN=', process.env.MAILGUN_DOMAIN || 'NOT SET');

  // PRIORITY 1: If Mailgun credentials are provided, use Mailgun Web API
  if (process.env.MAILGUN_API_KEY && process.env.MAILGUN_DOMAIN) {
    try {
      console.log('📧 Attempting Mailgun Web API...');
      // Dynamic import to prevent load errors if package is missing
      const FormData = (await import('form-data')).default;
      const MailgunClient = (await import('mailgun.js')).default;
      const mailgun = new MailgunClient(FormData);
      const client = mailgun.client({ username: 'api', key: process.env.MAILGUN_API_KEY });
      const mg = client.domains.domain(process.env.MAILGUN_DOMAIN);
      
      const fromName = process.env.MAILGUN_FROM_NAME || 'ProShop';
      const fromEmail = process.env.MAILGUN_FROM_EMAIL || `noreply@${process.env.MAILGUN_DOMAIN}`;
      
      console.log('📧 From Email:', fromEmail);
      console.log('📧 From Name:', fromName);

      const messageData = {
        to,
        from: `${fromName} <${fromEmail}>`,
        subject,
        html,
      };

      console.log('📧 Sending via Mailgun Web API...');
      const result = await mg.messages.create(messageData);
      console.log('✅ EMAIL SENT SUCCESSFULLY via Mailgun');
      console.log('  Message ID:', result.id);
      console.log('📧 ================================\n');
      return { sent: true, via: 'mailgun', messageId: result.id };
    } catch (mgErr) {
      console.error('\n❌ ================================');
      console.error('❌ MAILGUN WEB API FAILED');
      console.error('❌ ================================');
      console.error('❌ Error:', mgErr && mgErr.message ? mgErr.message : String(mgErr));
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
    console.error('❌ EMAIL SEND FAILED (BOTH Mailgun + SMTP)');
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
