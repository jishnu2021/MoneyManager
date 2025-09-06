// cloudinaryConfig.js
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// Configure Cloudinary with environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Test Cloudinary connection
export const testCloudinaryConnection = async () => {
  try {
    const result = await cloudinary.api.ping();
    console.log('✅ Cloudinary connected successfully:', result);
    return true;
  } catch (error) {
    console.error('❌ Cloudinary connection failed:', error.message);
    return false;
  }
};

// Upload image helper function
export const uploadToCloudinary = async (filePath, options = {}) => {
  try {
    const defaultOptions = {
      folder: 'profile_images',
      transformation: [
        { width: 300, height: 300, crop: 'fill' },
        { quality: 'auto' },
        { format: 'auto' }
      ],
      ...options
    };

    const result = await cloudinary.uploader.upload(filePath, defaultOptions);
    return result;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error('Failed to upload image to Cloudinary');
  }
};

// Delete image helper function
export const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    console.log('Image deleted from Cloudinary:', result);
    return result;
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw new Error('Failed to delete image from Cloudinary');
  }
};

// Get optimized image URL
export const getOptimizedImageUrl = (publicId, transformations = {}) => {
  const defaultTransformations = {
    width: 300,
    height: 300,
    crop: 'fill',
    quality: 'auto',
    format: 'auto',
    ...transformations
  };

  return cloudinary.url(publicId, defaultTransformations);
};

export default cloudinary;
