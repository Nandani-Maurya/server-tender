const express = require('express');
const router = express.Router();
const documentController = require('../controllers/documentController');
const upload = require('../middlewares/upload');

// POST /api/documents
// Expects multipart/form-data with a file field named "document"
router.post('/', upload.single('document'), documentController.uploadDocument);

module.exports = router;
