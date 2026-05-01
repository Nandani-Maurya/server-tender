const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

// Ensure uploads directory exists for local storage
const uploadDir = 'uploads/documents';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Cloudinary Storage
const cloudinaryStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'tenders/documents',
    allowed_formats: ['jpg', 'jpeg', 'png', 'pdf'],
    public_id: (req, file) => {
      return `${Date.now()}_${file.originalname.replace(/[^a-zA-Z0-9]/g, '_')}`;
    }
  }
});

// Local Storage
const localStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}_${file.originalname.replace(/[^a-zA-Z0-9]/g, '_')}`);
  }
});

// Choose storage based on environment variable
const useLocal = process.env.UPLOAD_STORAGE === 'local';
const storage = useLocal ? localStorage : cloudinaryStorage;

const upload = multer({ storage: storage });

module.exports = upload;
