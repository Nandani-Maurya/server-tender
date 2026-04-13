const express = require('express');
const router = express.Router();
const tenderController = require('../controllers/tender.controller');
const { protect } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');

// Public routes
router.get('/', tenderController.getAllTenders);
router.get('/:id', tenderController.getTenderById);

// Protected routes
router.use(protect);

// Bid routes
router.post('/bid', authorize('USER'), tenderController.submitBid);
router.get('/my-bids', authorize('USER'), tenderController.getMyBids);

// Admin/Manager routes for tenders
router.post('/', authorize('ADMIN', 'MANAGER'), tenderController.createTender);
router.put('/:id', authorize('ADMIN', 'MANAGER'), tenderController.updateTender);
router.delete('/:id', authorize('ADMIN'), tenderController.deleteTender);

// View bids for a specific tender (Admin/Manager only)
router.get('/:tenderId/bids', authorize('ADMIN', 'MANAGER'), tenderController.getBidsByTender);

module.exports = router;
