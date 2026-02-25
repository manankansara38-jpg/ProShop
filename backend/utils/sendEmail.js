import nodemailer from 'nodemailer';

const sendEmail = async ({ to, subject, html }) => {
  console.log('\n📧 ================================');
  console.log('📧 EMAIL SEND REQUESTED');
  console.log('📧 ================================');
  console.log('📧 To:', to);
  console.log('📧 Subject:', subject);
  
  // Validate email configuration
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.error('❌ EMAIL CONFIG ERROR:');
    console.error('  SMTP_HOST:', process.env.SMTP_HOST ? '✅ Set' : '❌ Missing');
    console.error('  SMTP_USER:', process.env.SMTP_USER ? '✅ Set' : '❌ Missing');
    console.error('  SMTP_PASS:', process.env.SMTP_PASS ? '✅ Set' : '❌ Missing');
    console.error('❌ Email service not configured. Please check .env file');
    return { error: 'Email service not configured', sent: false };
  }

  try {
    console.log('📧 SMTP Config:');
    console.log('  Host:', process.env.SMTP_HOST);
    console.log('  Port:', process.env.SMTP_PORT || 587);
    console.log('  User:', process.env.SMTP_USER);
    console.log('  From:', process.env.SMTP_FROM || process.env.SMTP_USER);

    // Create transport using SMTP config from env
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_PORT === '465', // true for 465, false for 587
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      // Connection settings
      connectionTimeout: 10000, // 10 second timeout
      socketTimeout: 10000,
      logger: process.env.NODE_ENV === 'development' ? true : false,
      debug: process.env.NODE_ENV === 'development' ? true : false,
    });

    // Verify connection to SMTP server
    console.log('📧 Verifying SMTP connection...');
    try {
      await Promise.race([
        transporter.verify(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('SMTP verify timeout')), 8000)
        ),
      ]);
      console.log('✅ SMTP connection verified');
    } catch (verifyErr) {
      console.warn('⚠️ SMTP verify failed:', verifyErr.message);
      // Continue anyway - verification might fail but sending could work
    }

    // Friendly sender name
    const rawFromAddress = process.env.SMTP_FROM || process.env.SMTP_USER;
    const from = `ProShop <${rawFromAddress}>`;

    console.log('📧 Sending email from:', from, 'to:', to);

    // Send mail with extended timeout
    const info = await Promise.race([
      transporter.sendMail({
        from,
        to,
        subject,
        html,
        replyTo: process.env.SMTP_USER,
      }),
      // 15 second timeout for actual sending
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Email send timeout after 15s')), 15000)
      ),
    ]);

    console.log('✅ EMAIL SENT SUCCESSFULLY');
    console.log('  MessageID:', info.messageId);
    console.log('  Response:', info.response);
    console.log('📧 ================================\n');
    return { sent: true, messageId: info.messageId };
  } catch (error) {
    console.error('\n❌ ================================');
    console.error('❌ EMAIL SEND FAILED');
    console.error('❌ ================================');
    console.error('❌ Error:', error.message);
    console.error('❌ Code:', error.code);
    console.error('❌ To:', to);
    console.error('❌ Subject:', subject);
    console.error('❌ ================================\n');
    
    // Log full error for debugging
    console.error('Full error:', error);
    
    // Return error but don't throw - orders should still be marked as paid
    return { error: error.message, sent: false };
  }
};

export default sendEmail;
