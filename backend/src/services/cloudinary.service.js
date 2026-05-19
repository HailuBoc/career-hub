const { Readable } = require('stream');

const isCloudinaryConfigured = () => {
  return !!(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET &&
    process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloud_name' &&
    process.env.CLOUDINARY_API_KEY !== 'your_api_key'
  );
};

const uploadToCloudinary = async (buffer, options = {}) => {
  // If Cloudinary is not configured, store as base64 data URL
  if (!isCloudinaryConfigured()) {
    const base64 = buffer.toString('base64');
    // Detect mime type from buffer magic bytes
    let mimeType = 'image/jpeg';
    if (buffer[0] === 0x89 && buffer[1] === 0x50) mimeType = 'image/png';
    else if (buffer[0] === 0x47 && buffer[1] === 0x49) mimeType = 'image/gif';
    else if (buffer[0] === 0x52 && buffer[1] === 0x49) mimeType = 'image/webp';

    const dataUrl = `data:${mimeType};base64,${base64}`;
    return {
      secure_url: dataUrl,
      public_id: null,
    };
  }

  // Cloudinary is configured — upload normally
  const cloudinary = require('../config/cloudinary');
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: 'applicanthub', ...options },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    const readable = new Readable();
    readable.push(buffer);
    readable.push(null);
    readable.pipe(uploadStream);
  });
};

const deleteFromCloudinary = async (publicId) => {
  // Skip deletion if no publicId or Cloudinary not configured
  if (!publicId || !isCloudinaryConfigured()) return;
  const cloudinary = require('../config/cloudinary');
  return cloudinary.uploader.destroy(publicId);
};

module.exports = { uploadToCloudinary, deleteFromCloudinary };
