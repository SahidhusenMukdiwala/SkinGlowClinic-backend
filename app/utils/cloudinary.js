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
