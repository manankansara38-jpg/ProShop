import dotenv from 'dotenv';
dotenv.config();
import sendEmail from '../utils/sendEmail.js';

console.log('\n🧪 ========================================');
console.log('🧪 EMAIL CONFIGURATION TEST');
console.log('🧪 ========================================\n');

// Check environment variables
console.log('✅ ENVIRONMENT VARIABLES:');
console.log('  NODE_ENV:', process.env.NODE_ENV);
console.log('  SMTP_HOST:', process.env.SMTP_HOST ? '✅ Set' : '❌ NOT SET');
console.log('  SMTP_PORT:', process.env.SMTP_PORT || 587);
console.log('  SMTP_USER:', process.env.SMTP_USER ? '✅ Set' : '❌ NOT SET');
console.log('  SMTP_PASS:', process.env.SMTP_PASS ? '✅ Set (hidden)' : '❌ NOT SET');
console.log('  SMTP_FROM:', process.env.SMTP_FROM || '(using SMTP_USER)');
console.log('');

if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
  console.error('❌ MISSING REQUIRED EMAIL CONFIGURATION');
  console.error('Please add to your .env file:');
  console.error('  SMTP_HOST=smtp.gmail.com');
  console.error('  SMTP_PORT=587');
  console.error('  SMTP_USER=your_email@gmail.com');
  console.error('  SMTP_PASS=your_app_password');
  console.error('  SMTP_FROM=ProShop <your_email@gmail.com>');
  process.exit(1);
}

// Send test email
const testEmail = process.env.SMTP_USER; // Send to the configured email account
const subject = '✅ ProShop Email Configuration Test - ' + new Date().toISOString();
const html = `
  <h2>✅ ProShop Email Configuration Test</h2>
  <p>If you received this email, your SMTP configuration is <strong>WORKING CORRECTLY</strong>! 🎉</p>
  
  <h3>Configuration Details:</h3>
  <ul>
    <li><strong>SMTP Host:</strong> ${process.env.SMTP_HOST}</li>
    <li><strong>SMTP Port:</strong> ${process.env.SMTP_PORT || 587}</li>
    <li><strong>From:</strong> ${process.env.SMTP_FROM || process.env.SMTP_USER}</li>
    <li><strong>To:</strong> ${testEmail}</li>
  </ul>
  
  <p style="color: green;"><strong>✅ All order confirmation and thank you emails should now work!</strong></p>
  
  <p>Sent at: ${new Date().toLocaleString()}</p>
`;

console.log('🧪 Sending test email to:', testEmail);
console.log('');

sendEmail({ to: testEmail, subject, html })
  .then((result) => {
    if (result.sent) {
      console.log('\n✅ ========================================');
      console.log('✅ TEST EMAIL SENT SUCCESSFULLY!');
      console.log('✅ ========================================');
      console.log('✅ Message ID:', result.messageId);
      console.log('\n🎉 Your email configuration is WORKING!');
      console.log('📧 Order confirmations and thank you emails will be sent after payment.\n');
      process.exit(0);
    } else {
      console.error('\n❌ ========================================');
      console.error('❌ TEST EMAIL FAILED');
      console.error('❌ ========================================');
      console.error('❌ Error:', result.error);
      console.error('\n⚠️ EMAIL CONFIGURATION ISSUES:');
      console.error('1. Check Gmail app password (not your account password)');
      console.error('2. Enable "Less secure app access" if not using app password');
      console.error('3. Verify SMTP credentials in .env are correct');
      console.error('4. Check that Gmail 2FA is enabled (required for app passwords)\n');
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error('\n❌ ========================================');
    console.error('❌ FATAL ERROR');
    console.error('❌ ========================================');
    console.error('❌ Error:', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  });
