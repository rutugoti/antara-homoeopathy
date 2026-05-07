'use strict';

const cloudinary = require('cloudinary').v2;

const isPlaceholder = 
  !process.env.CLOUDINARY_CLOUD_NAME || 
  process.env.CLOUDINARY_CLOUD_NAME === 'your_cloud_name' ||
  process.env.CLOUDINARY_API_KEY === 'your_api_key';

if (!isPlaceholder) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key:    process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

// ─── Exports ──────────────────────────────────────────────────────────────────

/**
 * Upload a file buffer to Cloudinary.
 *
 * @param {Buffer} buffer          - File buffer from multer memoryStorage
 * @param {string} [folder]        - Cloudinary folder path
 * @returns {Promise<string>}      - The secure URL of the uploaded asset
 */
const uploadImage = (buffer, folder = 'antara-homoeopathy/patients') => {
  if (isPlaceholder) {
    console.warn('Cloudinary keys are placeholders. Returning mock URL.');
    return Promise.resolve('https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg');
  }

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        transformation: [{ quality: 'auto', fetch_format: 'auto' }],
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );

    stream.end(buffer);
  });
};

/**
 * Delete an asset from Cloudinary by its public ID.
 *
 * @param {string} publicId   - The Cloudinary public ID of the asset
 * @returns {Promise<Object>} - Cloudinary destroy result
 */
const deleteImage = async (publicId) => {
  if (isPlaceholder) return { result: 'ok' };
  const result = await cloudinary.uploader.destroy(publicId);
  return result;
};

module.exports = { uploadImage, deleteImage };
