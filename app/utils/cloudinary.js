  import { v2 as cloudinary } from 'cloudinary';
import { env } from '../config/env.js';
import { logger } from './logger.js';

cloudinary.config({
  cloud_name: env.CLOUDINARY.CLOUD_NAME,
  api_key: env.CLOUDINARY.API_KEY,
  api_secret: env.CLOUDINARY.API_SECRET,
});

/**
 * Upload buffer directly to Cloudinary without writing to disk
 * @param {Buffer} buffer - File buffer from Multer memoryStorage
 * @param {string} folder - Destination folder, e.g. 'skinglowclinic/treatments'
 * @param {object} options - Optional cloudinary upload options
 * @returns {Promise<{ secure_url: string, public_id: string }>}
 */
export const uploadBufferToCloudinary = (buffer, folder = 'skinglowclinic/general', options = {}) => {
  // Graceful fallback for local development if Cloudinary credentials are placeholder
  const isMockCredentials =
    !env.CLOUDINARY.API_KEY ||
    env.CLOUDINARY.API_KEY === 'your_api_key' ||
    env.CLOUDINARY.API_SECRET === 'your_api_secret';

  if (isMockCredentials) {
    logger.warn('Cloudinary credentials not set or using placeholders. Using high-quality skincare asset URL for local dev.');
    const sampleImages = [
      'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1584297091622-af8e5bd80b13?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1560750588-73207b1ef5b8?auto=format&fit=crop&w=1000&q=80',
    ];
    const picked = sampleImages[Math.floor(Math.random() * sampleImages.length)];
    return Promise.resolve({
      secure_url: picked,
      public_id: `mock_${Date.now()}`,
    });
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        quality: 'auto',
        fetch_format: 'auto',
        resource_type: 'image',
        ...options,
      },
      (error, result) => {
        if (error) {
          logger.error('Cloudinary upload error:', error);
          if (env.NODE_ENV !== 'production') {
            logger.warn('Falling back to placeholder image in non-production mode.');
            return resolve({
              secure_url: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=1000&q=80',
              public_id: `fallback_${Date.now()}`,
            });
          }
          return reject(error);
        }
        resolve({
          secure_url: result.secure_url,
          public_id: result.public_id,
        });
      }
    );
    uploadStream.end(buffer);
  });
};

/**
 * Delete asset from Cloudinary by public_id
 * @param {string} publicId
 */
export const deleteFromCloudinary = async (publicId) => {
  try {
    if (!publicId) return;
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    logger.error(`Failed to delete Cloudinary asset ${publicId}:`, error);
  }
};

export { cloudinary };
