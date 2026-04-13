const express = require('express');
const router = express.Router();
const FormatController = require('../controllers/format.controller');

router.get('/', FormatController.getAllFormats);
router.get('/:id', FormatController.getFormatById);
router.put('/:id/mapping', FormatController.updateFormatMapping);
router.put('/:id', FormatController.updateFormatContent);
router.delete('/:id', FormatController.deleteFormat);

module.exports = router;
