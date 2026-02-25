# ProShop - Image Migration & Production Deployment Guide

## Problem: Razorpay Shows "x-rtb-fingerprint-id" and Image Loading Errors

**Error Messages You're Seeing:**
```
Refused to get unsafe header "x-rtb-fingerprint-id"
Access to image at 'http://localhost:7070/...' blocked by CORS policy
Failed to load resource: net::ERR_FAILED
```

**Root Cause:**
- Product images are stored as local paths (`/images/product.jpg`) in the database
- When Razorpay tries to load product images during checkout, it can't access localhost URLs
- Razorpay needs publicly accessible image URLs

---

## Solution: Migrate Images to Cloudinary

### Step 1: Ensure Cloudinary Credentials Are Set

In your `.env` file, add:
```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Get credentials from: https://cloudinary.com/console/settings

### Step 2: Run Image Migration Script

This script uploads all product images from `/images/` folder to Cloudinary and updates the database:

```bash
# Install dependencies if not already done
npm install

# Run the migration
npm run migrate-images
```

**What this does:**
- ✅ Uploads all `/images/*.jpg` files to Cloudinary
- ✅ Updates all product records with Cloudinary URLs
- ✅ Creates publicly accessible image URLs
- ✅ Skips images already on Cloudinary

**Expected Output:**
```
🚀 Starting bulk image upload to Cloudinary...
✅ Airpods Wireless Bluetooth Headphones - https://res.cloudinary.com/...
✅ iPhone 13 Pro - https://res.cloudinary.com/...
✅ All products migrated successfully!
```

### Step 3: Verify Images Were Migrated

1. Check MongoDB: Products should now have Cloudinary URLs
2. Check your app: Product images should load from Cloudinary
3. Test Razorpay: Images should now display in Razorpay checkout

---

## If You Upload New Products via Admin

When uploading new product images through the admin panel:
1. Images are automatically uploaded to Cloudinary
2. Database stores the Cloudinary URL
3. No further migration needed

---

## Production Deployment Checklist

Before deploying to production:

- [ ] **Verify Cloudinary credentials in production `.env`**
- [ ] **Run `npm run migrate-images`** to upload all images
- [ ] **Check that all product images are Cloudinary URLs** in database
- [ ] **Set `NODE_ENV=production`**
- [ ] **Set `PRODUCTION_DOMAIN=https://yourdomain.com`**
- [ ] **Test Razorpay checkout** with real/test payment

---

## Headers Fixed for Razorpay

These headers are now properly configured:

✅ **CORS Headers** - Allow Razorpay to fetch resources
✅ **Permissions-Policy** - Properly configured with `payment` permission for Razorpay
✅ **Access-Control-Expose-Headers** - Include `x-rtb-fingerprint-id` for RTB tracking
✅ **CORS Preflight** - OPTIONS requests properly handled

---

## Manual Image Upload (Alternative)

If you prefer to upload specific images:

```bash
# Upload single image folder
node backend/scripts/uploadBannerImages.js

# Or use the admin panel to upload during product creation
```

---

## Troubleshooting

### Images Still Showing as localhost URLs?

1. Check database: `db.products.findOne()` - does it have `cloudinary.com` URL?
2. Run migration: `npm run migrate-images`
3. Check Cloudinary account: https://cloudinary.com/console

### Razorpay Still Shows Missing Images?

1. Verify Cloudinary URLs are public (not restricted)
2. Check Razorpay test checkout: Do images load?
3. Clear browser cache and refresh

### Migration Script Fails?

1. Verify Cloudinary credentials are correct
2. Check `/images/` folder exists with image files
3. Check MongoDB connection is active
4. Run with debug: `DEBUG=* npm run migrate-images`

---

## Questions?

Refer to:
- Cloudinary Docs: https://cloudinary.com/documentation
- Razorpay Docs: https://razorpay.com/docs/
- ProShop Backend: `backend/scripts/updateImagesToCloudinary.js`
