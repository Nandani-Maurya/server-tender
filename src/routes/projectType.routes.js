const express = require('express');
const router = express.Router();
const ProjectTypeController = require('../controllers/projectType.controller');

// CRUD Routes for Project Types
router.get('/', ProjectTypeController.getProjectTypes);
router.post('/', ProjectTypeController.createProjectType);
router.put('/:id', ProjectTypeController.updateProjectType);
router.delete('/:id', ProjectTypeController.deleteProjectType);

module.exports = router;
