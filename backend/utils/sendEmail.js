import nodemailer from 'nodemailer';

const sendEmail = async ({ to, subject, html }) => {
  console.log('sendEmail called with:', { to, subject });
  
  // Create transport using SMTP config from env
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_PORT === '465', // true for 465, false for 587
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  // Ensure friendly sender name appears in recipients' inboxes.
  // Format as: "ProShop <email@domain.com>" while falling back to env values.
  const rawFromAddress = process.env.SMTP_FROM || process.env.SMTP_USER;
  const from = `ProShop <${rawFromAddress}>`;
  console.log('Email config - from:', from, 'SMTP host:', process.env.SMTP_HOST);

  const info = await transporter.sendMail({
    from,
    to,
    subject,
    html,
  });

  console.log('Email sent successfully, messageId:', info.messageId, 'response:', info.response);
  return info;
};

export default sendEmail;
