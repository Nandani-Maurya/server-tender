const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'tenders/documents',
    allowed_formats: ['jpg', 'jpeg', 'png', 'pdf'],

    public_id: (req, file) => {
      return `${Date.now()}_${file.originalname.replace(/[^a-zA-Z0-9]/g, '_')}`;
    }
  }
});

const upload = multer({ storage: storage });

module.exports = upload;
