const cloudinary = require('cloudinary').v2;

const isCloudinaryConfigured = () => {
  return Boolean(
    process.env.CLOUDINARY_URL ||
      (process.env.CLOUDINARY_CLOUD_NAME &&
        process.env.CLOUDINARY_API_KEY &&
        process.env.CLOUDINARY_API_SECRET)
  );
};

if (isCloudinaryConfigured()) {
  if (!process.env.CLOUDINARY_URL) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true,
    });
  }
}

/**
 * Upload a local file or buffer to Cloudinary
 * @param {string|Buffer} fileInput - Absolute file path or Buffer
 * @param {object} options - Cloudinary upload options
 * @returns {Promise<object>} Upload result with secure_url
 */
const uploadToCloudinary = (fileInput, options = {}) => {
  return new Promise((resolve, reject) => {
    const defaultOptions = {
      folder: 'shanan_gibe_union',
      resource_type: 'auto',
      ...options,
    };

    if (Buffer.isBuffer(fileInput)) {
      const uploadStream = cloudinary.uploader.upload_stream(
        defaultOptions,
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );
      uploadStream.end(fileInput);
    } else {
      cloudinary.uploader.upload(fileInput, defaultOptions, (error, result) => {
        if (error) return reject(error);
        resolve(result);
      });
    }
  });
};

module.exports = {
  cloudinary,
  isCloudinaryConfigured,
  uploadToCloudinary,
};
