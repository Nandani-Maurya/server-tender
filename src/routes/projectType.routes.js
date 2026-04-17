const express = require('express');
const router = express.Router();
const ProjectTypeController = require('../controllers/projectType.controller');
const { protect } = require('../middlewares/auth.middleware');


router.use(protect);


router.get('/', ProjectTypeController.getProjectTypes);
router.post('/', ProjectTypeController.createProjectType);
router.put('/:id', ProjectTypeController.updateProjectType);
router.delete('/:id', ProjectTypeController.deleteProjectType);

module.exports = router;
