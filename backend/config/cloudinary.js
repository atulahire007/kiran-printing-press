const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Product image storage
const productStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'kiran-printing/products',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 800, height: 800, crop: 'limit', quality: 'auto' }],
  },
});

// Design file storage (customer uploads)
const designStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const isPDF = file.mimetype === 'application/pdf';
    return {
      folder: 'kiran-printing/designs',
      allowed_formats: ['jpg', 'jpeg', 'png', 'pdf', 'ai', 'psd', 'cdr'],
      resource_type: isPDF ? 'raw' : 'image',
      public_id: `design_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
  },
});

// Banner storage
const bannerStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'kiran-printing/banners',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 1920, height: 600, crop: 'limit', quality: 'auto' }],
  },
});

// Gallery storage
const galleryStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'kiran-printing/gallery',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 1200, height: 800, crop: 'limit', quality: 'auto' }],
  },
});

// Multer upload instances
exports.uploadProductImages = multer({
  storage: productStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files are allowed'), false);
  },
});

exports.uploadDesignFile = multer({
  storage: designStorage,
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowed = [
      'image/jpeg', 'image/png', 'image/jpg',
      'application/pdf',
      'application/postscript', // .ai
      'image/vnd.adobe.photoshop', // .psd
      'application/x-cdr', // .cdr
    ];
    if (allowed.includes(file.mimetype) || file.originalname.match(/\.(ai|psd|cdr)$/i)) {
      cb(null, true);
    } else {
      cb(new Error('Unsupported file format. Please upload PDF, PNG, JPG, AI, PSD, or CDR'), false);
    }
  },
});

exports.uploadBanner = multer({
  storage: bannerStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files are allowed'), false);
  },
});

exports.uploadGallery = multer({
  storage: galleryStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files are allowed'), false);
  },
});

exports.cloudinary = cloudinary;

// Delete file from Cloudinary
exports.deleteFromCloudinary = async (publicId, resourceType = 'image') => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
    return result;
  } catch (error) {
    throw new Error(`Failed to delete file from Cloudinary: ${error.message}`);
  }
};
