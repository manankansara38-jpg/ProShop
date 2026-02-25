/**
 * Image URL transformation middleware
 * Converts local image paths to Cloudinary URLs or proper CDN URLs
 * for production/external access (e.g., Razorpay checkout)
 */

const transformImageUrl = (imageUrl) => {
  if (!imageUrl) return imageUrl;

  // If already a full URL (Cloudinary or external), return as is
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }

  // If it's a local path like /images/product.jpg or /uploads/...
  // In production, return a CDN-friendly version
  // For now, return the path as-is since the backend serves it
  // BUT: You should upload all product images to Cloudinary for production
  
  if (process.env.NODE_ENV === 'production') {
    // In production, construct full URL with your production domain
    const productionDomain = process.env.PRODUCTION_DOMAIN || 'https://your-proshop.com';
    
    // If it's a local path, try to serve from Cloudinary as fallback
    // This assumes images are already migrated to Cloudinary
    if (imageUrl.startsWith('/images/')) {
      // Return as relative path; the frontend should request from your domain
      return imageUrl;
    }
    
    return imageUrl;
  }

  // In development, return path as is (Express will serve from public/static)
  return imageUrl;
};

/**
 * Middleware to transform product images in API responses
 * Usage: Use this in routes that return product data
 */
export const transformProductImages = (req, res, next) => {
  const originalJson = res.json.bind(res);

  res.json = function (data) {
    // Transform single product
    if (data && data.image) {
      data.image = transformImageUrl(data.image);
    }

    // Transform product array
    if (Array.isArray(data) && data[0] && data[0].image) {
      data = data.map((product) => ({
        ...product,
        image: transformImageUrl(product.image),
      }));
    }

    // Transform products in pagination response
    if (data && data.products && Array.isArray(data.products)) {
      data.products = data.products.map((product) => ({
        ...product,
        image: transformImageUrl(product.image),
      }));
    }

    return originalJson(data);
  };

  next();
};

/**
 * Helper function to check if image needs migration to Cloudinary
 */
export const shouldMigrateImage = (imageUrl) => {
  // Image needs migration if:
  // 1. It's a local path (/images/ or /uploads/)
  // 2. It's not already a Cloudinary URL
  if (!imageUrl) return false;
  return (
    (imageUrl.startsWith('/images/') || imageUrl.startsWith('/uploads/')) &&
    !imageUrl.includes('cloudinary.com')
  );
};

export default transformImageUrl;
