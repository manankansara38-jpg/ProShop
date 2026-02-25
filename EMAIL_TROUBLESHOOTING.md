# 📧 Email Configuration & Troubleshooting Guide

## Problem: Emails Not Being Sent After Payment

If you complete a Razorpay payment but don't receive order confirmation and thank you emails, follow this guide.

---

## Step 1: Test Your Email Configuration

Run the email test to verify your SMTP setup is working:

```bash
npm run test-email
```

### Expected Output (Success):
```
✅ ========================================
✅ TEST EMAIL SENT SUCCESSFULLY!
✅ ========================================
✅ Message ID: <message-id>

🎉 Your email configuration is WORKING!
📧 Order confirmations and thank you emails will be sent after payment.
```

### If Test Fails:
The script will show you exactly what's wrong. Continue to Step 2.

---

## Step 2: Verify Email Credentials in `.env`

Check that your `.env` file has **ALL** required email settings:

```env
# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM=ProShop <your_email@gmail.com>
```

### ⚠️ IMPORTANT: Gmail Users

If you're using Gmail, you **CANNOT use your regular password**.  
You must create an **App Password**:

1. Go to: https://myaccount.google.com/apppasswords
2. Select **Mail** and **Windows Computer** (or your platform)
3. Generate a 16-character password
4. Copy this password to `.env` as `SMTP_PASS=`
5. **Do NOT use your account password**

### Requirements:
- ✅ Gmail account with 2-Factor Authentication **ENABLED**
- ✅ Use App Password (not account password)
- ✅ `SMTP_HOST=smtp.gmail.com`
- ✅ `SMTP_PORT=587` (not 465)

---

## Step 3: Check Backend Logs

When you complete a payment, check your backend console for email logs:

### Success Logs (You Should See):
```
📧 ================================
📧 EMAIL SEND REQUESTED
📧 ================================
📧 To: customer@email.com
📧 Subject: Order Confirmation - Order #...

✅ SMTP connection verified
✅ EMAIL SENT SUCCESSFULLY
  MessageID: <email-message-id>
```

### Error Logs (What Went Wrong):
```
❌ ================================
❌ EMAIL SEND FAILED
❌ ================================
❌ Error: Invalid login
❌ Code: EAUTH
```

---

## Step 4: Common Email Errors & Solutions

### Error: `EAUTH - Invalid login`
**Problem:** Wrong email credentials
```
❌ Error: 535 5.7.8 Username and password not accepted
```
**Solution:**
1. Verify email address is correct in `.env`
2. If using Gmail, use App Password (not account password)
3. Check that Gmail 2FA is **enabled**: https://myaccount.google.com/security
4. Generate a new App Password

### Error: `ECONNREFUSED - Connection refused`
**Problem:** SMTP server unreachable
```
❌ Error: ECONNREFUSED 127.0.0.1:587
```
**Solution:**
1. Check internet connection
2. Verify `SMTP_HOST=smtp.gmail.com` (not localhost)
3. If behind corporate firewall, verify SMTP port 587 is not blocked

### Error: `ETIMEDOUT - Connection timeout`
**Problem:** SMTP server taking too long
```
❌ Error: ETIMEDOUT
```
**Solution:**
1. Check internet connection
2. Increase timeout in `backend/utils/sendEmail.js` (currently 15 seconds)
3. Try using `SMTP_PORT=465` with `secure=true`

### Error: `Gmail Less Secure Apps`
**Problem:** Gmail blocked the connection
```
❌ Error: Please log in via your web browser and then try again
```
**Solution:**
- **Do NOT enable "Less Secure Apps"** (deprecated by Google)
- **Use App Password instead** (see Step 2)

---

## Step 5: Test with Different Email Service (Optional)

If Gmail doesn't work, try another SMTP provider:

### Using Mailtrap (Free for testing):
```env
SMTP_HOST=live.smtp.mailtrap.io
SMTP_PORT=587
SMTP_USER=your_mailtrap_user
SMTP_PASS=your_mailtrap_password
SMTP_FROM=notifications@example.com
```

Get free Mailtrap account: https://mailtrap.io

### Using SendGrid (Free tier available):
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your_sendgrid_api_key
SMTP_FROM=noreply@yourdomain.com
```

Get free SendGrid account: https://sendgrid.com

---

## Step 6: Verify Emails Are Being Attempted

Check MongoDB logs in your backend:

After clicking "Pay Now" in Razorpay, you should see in server console:

```
💳 RAZORPAY PAYMENT UPDATE REQUEST:
✅ Order marked as paid: [order-id]

📧 EMAIL SEND REQUESTED
📧 To: customer@email.com
📧 Subject: Order Confirmation - Order #...
✅ EMAIL SENT SUCCESSFULLY
  MessageID: <message-id>

📧 EMAIL SEND REQUESTED
📧 To: customer@email.com
📧 Subject: Thank You for Your Order! Here's Your Next Purchase Discount 🎁
✅ EMAIL SENT SUCCESSFULLY
```

If you see `❌ EMAIL SEND FAILED`, the error details are logged.

---

## Step 7: Frontend Verification

After payment, user should see this toast message:

```
🎉 Order is paid successfully! Confirmation email will be sent shortly.
```

If they see an error, check browser console for details.

---

## Email Sending Flow

```
User Pays via Razorpay
        ↓
Backend receives payment confirmation
        ↓
Order marked as paid in database
        ↓
✅ Response sent to frontend (immediate)
        ↓
Emails queued for background sending
        ↓
2 Emails sent (async, non-blocking):
  1. Order Confirmation (bill summary)
  2. Thank You Coupon (20% discount for next order)
```

**Important:** User sees payment success even if emails fail.  
Emails are sent in background, not required for order success.

---

## Debug Commands

### Test email configuration:
```bash
npm run test-email
```

### View recent orders (check if payment was saved):
```bash
# In MongoDB shell or Compass:
db.orders.find().sort({ createdAt: -1 }).limit(5)
```

### Check product images (related issue):
```bash
npm run verify-images
```

---

## Quick Checklist

- [ ] `.env` has `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS` set
- [ ] If using Gmail: App Password generated (not account password)
- [ ] Gmail 2FA is **enabled**: https://myaccount.google.com/security
- [ ] Run `npm run test-email` and receive test email
- [ ] `SMTP_PORT=587` (for Gmail)
- [ ] Backend logs show `✅ EMAIL SENT SUCCESSFULLY` after payment
- [ ] Check inbox AND spam/promotions folder
- [ ] Internet connection is active
- [ ] Razorpay payment shows success in order details

---

## Still Not Working?

Share these logs from your backend console:
1. The `npm run test-email` output
2. The backend logs after attempting a Razorpay payment
3. Your `.env` email settings (redact passwords)

This will help diagnose the issue quickly.
