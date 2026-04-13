const express = require('express');
const router = express.Router();
const MappingController = require('../controllers/mapping.controller');

router.get('/', MappingController.getMappings);
router.get('/options', MappingController.getFilterOptions);
router.post('/', MappingController.createMapping);
router.delete('/:id', MappingController.deleteMapping);

module.exports = router;
