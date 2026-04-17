const express = require('express');
const router = express.Router();
const documentController = require('../controllers/documentController');
const upload = require('../middlewares/upload');



router.post('/', upload.single('document'), documentController.uploadDocument);

module.exports = router;
