import nodemailer from 'nodemailer';

const sendEmail = async ({ to, subject, html }) => {
  console.log('📧 sendEmail called with:', { to, subject });
  
  // Validate email configuration
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.error('❌ Email configuration missing. Check: SMTP_HOST, SMTP_USER, SMTP_PASS');
    throw new Error('Email service not configured. Please contact support.');
  }

  try {
    // Create transport using SMTP config from env
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_PORT === '465', // true for 465, false for 587
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      // Add timeout settings
      connectionTimeout: 5000,
      socketTimeout: 5000,
    });

    // Verify connection to SMTP server once
    // Commented out because it can slow things down - trust the config is correct
    // await transporter.verify();

    // Friendly sender name
    const rawFromAddress = process.env.SMTP_FROM || process.env.SMTP_USER;
    const from = `ProShop <${rawFromAddress}>`;
    
    console.log('📧 Email config - from:', from, 'to:', to);

    // Send mail with timeout
    const info = await Promise.race([
      transporter.sendMail({
        from,
        to,
        subject,
        html,
      }),
      // 5 second timeout
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Email send timeout after 5s')), 5000)
      ),
    ]);

    console.log('✅ Email sent successfully to:', to, 'messageId:', info.messageId);
    return info;
  } catch (error) {
    console.error('❌ Error sending email to', to, ':', error.message);
    // Don't re-throw - log and continue since email is non-critical
    return { error: error.message, sent: false };
  }
};

export default sendEmail;
