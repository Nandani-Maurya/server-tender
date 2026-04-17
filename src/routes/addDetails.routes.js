const express = require('express');
const router = express.Router();
const basicDetailsController = require('../controllers/basicDetails.controller');
const bankController = require('../controllers/bank.controller');
const isoController = require('../controllers/iso.controller');
const { protect } = require('../middlewares/auth.middleware');


router.use(protect);


router.get('/active', basicDetailsController.getActiveOrganization);


router.post('/basic-firm', basicDetailsController.saveOrganization);


router.get('/bank/:orgId', bankController.getBankDetails);
router.post('/bank-details', bankController.saveBankDetails);


router.get('/iso/:orgId', isoController.getIsoCertificates);
router.post('/iso-certificates', isoController.saveIsoCertificates);

module.exports = router;
