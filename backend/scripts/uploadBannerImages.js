import dotenv from 'dotenv';
import cloudinary from 'cloudinary';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const bannerImages = [
  'image-1771674272715.png',  // Electronics
  'image-1771674410097.png',  // Fashion
  'image-1771586088878.png',  // Vegetables
  'image-1771586172674.png',  // Medicine
];

const uploadBannerImages = async () => {
  console.log('\n🚀 Uploading banner images to Cloudinary...\n');
  
  const results = {};
  
  for (const fileName of bannerImages) {
    const filePath = path.join(__dirname, '../../uploads/', fileName);
    
    try {
      console.log(`📤 Uploading: ${fileName}`);
      
      const result = await cloudinary.v2.uploader.upload(filePath, {
        folder: 'proshop-banners',
        resource_type: 'auto',
      });
      
      results[fileName] = result.secure_url;
      console.log(`✅ ${fileName}: ${result.secure_url}\n`);
    } catch (error) {
      console.error(`❌ Failed to upload ${fileName}:`, error.message);
    }
  }
  
  console.log('\n📋 Update ProductCarousel.jsx with these URLs:\n');
  console.log('banners: [');
  
  let count = 1;
  if (results['image-1771674272715.png']) {
    console.log(`  {
    id: 1,
    title: 'Electronics & Gadgets',
    subtitle: 'Latest Technology',
    category: 'Electronics',
    image: '${results['image-1771674272715.png']}',
  },`);
  }
  
  if (results['image-1771674410097.png']) {
    console.log(`  {
    id: 2,
    title: 'Fashion & Clothing',
    subtitle: 'Trendy Collection',
    category: 'Clothes',
    image: '${results['image-1771674410097.png']}',
  },`);
  }
  
  if (results['image-1771586088878.png']) {
    console.log(`  {
    id: 3,
    title: 'Fresh Vegetables',
    subtitle: 'Organic & Healthy',
    category: 'Vegetables',
    image: '${results['image-1771586088878.png']}',
  },`);
  }
  
  if (results['image-1771586172674.png']) {
    console.log(`  {
    id: 4,
    title: 'Medicine & Healthcare',
    subtitle: 'Your Health Matters',
    category: 'Medicine',
    image: '${results['image-1771586172674.png']}',
  }`);
  }
  
  console.log(']');
  console.log('\n✅ Done! Copy the above and update ProductCarousel.jsx');
};

uploadBannerImages();
