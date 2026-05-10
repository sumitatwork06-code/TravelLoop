const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Check if Cloudinary is configured
const isCloudinaryConfigured = process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloud_name' &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_KEY !== 'your_api_key';

let cloudinary = null;
let uploadTripImage, uploadAvatar;

if (isCloudinaryConfigured) {
  // --- Cloudinary mode ---
  cloudinary = require('cloudinary').v2;
  const { CloudinaryStorage } = require('multer-storage-cloudinary');

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  const tripStorage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder: 'traveloop/trips',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      transformation: [{ width: 1200, height: 800, crop: 'fill', quality: 'auto' }],
    },
  });

  const avatarStorage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder: 'traveloop/avatars',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      transformation: [{ width: 400, height: 400, crop: 'fill', quality: 'auto' }],
    },
  });

  uploadTripImage = multer({ storage: tripStorage, limits: { fileSize: 10 * 1024 * 1024 } });
  uploadAvatar = multer({ storage: avatarStorage, limits: { fileSize: 5 * 1024 * 1024 } });

  console.log('☁️  Cloudinary configured for image uploads');
} else {
  // --- Local disk mode (fallback) ---
  const uploadsDir = path.join(__dirname, 'uploads');
  const tripsDir = path.join(uploadsDir, 'trips');
  const avatarsDir = path.join(uploadsDir, 'avatars');

  // Create directories if they don't exist
  [uploadsDir, tripsDir, avatarsDir].forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  });

  const localTripStorage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, tripsDir),
    filename: (req, file, cb) => cb(null, `trip_${Date.now()}${path.extname(file.originalname)}`),
  });

  const localAvatarStorage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, avatarsDir),
    filename: (req, file, cb) => cb(null, `avatar_${Date.now()}${path.extname(file.originalname)}`),
  });

  uploadTripImage = multer({
    storage: localTripStorage,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      const allowed = /jpg|jpeg|png|webp/;
      const ext = allowed.test(path.extname(file.originalname).toLowerCase());
      const mime = allowed.test(file.mimetype.split('/')[1]);
      cb(null, ext && mime);
    },
  });

  uploadAvatar = multer({
    storage: localAvatarStorage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      const allowed = /jpg|jpeg|png|webp/;
      const ext = allowed.test(path.extname(file.originalname).toLowerCase());
      const mime = allowed.test(file.mimetype.split('/')[1]);
      cb(null, ext && mime);
    },
  });

  console.log('📁 Using local disk storage for uploads (Cloudinary not configured)');
}

module.exports = { cloudinary, uploadTripImage, uploadAvatar };
