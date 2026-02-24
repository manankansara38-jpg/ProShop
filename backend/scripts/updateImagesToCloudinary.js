import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cloudinary from 'cloudinary';
import Product from '../models/productModel.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure Cloudinary
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch((err) => {
    console.error('❌ MongoDB connection failed:', err);
    process.exit(1);
  });

// Upload image to Cloudinary
const uploadToCloudinary = async (localImagePath) => {
  try {
    console.log(`📤 Uploading: ${localImagePath}`);
    
    const result = await cloudinary.v2.uploader.upload(localImagePath, {
      folder: 'proshop-products',
      resource_type: 'auto',
    });
    
    console.log(`✅ Uploaded: ${result.secure_url}`);
    return result.secure_url;
  } catch (error) {
    console.error(`❌ Upload failed for ${localImagePath}:`, error.message);
    return null;
  }
};

// Main function to update all products
const updateProductImages = async () => {
  try {
    console.log('\n🚀 Starting bulk image upload to Cloudinary...\n');
    
    const products = await Product.find();
    console.log(`📦 Found ${products.length} products\n`);
    
    let updated = 0;
    let skipped = 0;
    
    for (const product of products) {
      if (!product.image) {
        console.log(`⏭️  Skipping "${product.name}" - No image path`);
        skipped++;
        continue;
      }
      
      // Check if already a Cloudinary URL
      if (product.image.includes('cloudinary.com')) {
        console.log(`⏭️  Skipping "${product.name}" - Already Cloudinary URL`);
        skipped++;
        continue;
      }
      
      // Try to find and upload local image
      const localPath = path.join(__dirname, '../../', product.image);
      
      if (!fs.existsSync(localPath)) {
        console.log(`⚠️  "${product.name}" - Local file not found: ${product.image}`);
        skipped++;
        continue;
      }
      
      const cloudinaryUrl = await uploadToCloudinary(localPath);
      
      if (cloudinaryUrl) {
        product.image = cloudinaryUrl;
        await product.save();
        console.log(`💾 Updated "${product.name}" in database\n`);
        updated++;
      } else {
        skipped++;
      }
    }
    
    console.log('\n✅ Bulk upload complete!');
    console.log(`📊 Summary: ${updated} updated, ${skipped} skipped`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

updateProductImages();
