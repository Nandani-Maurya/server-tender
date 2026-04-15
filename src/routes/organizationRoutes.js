const express = require('express');
const router = express.Router();
const organizationController = require('../controllers/organizationController');

// GET /api/organizations/active
router.get('/active', organizationController.getActiveOrganization);

// POST /api/organizations
router.post('/', organizationController.saveOrganization);

module.exports = router;
