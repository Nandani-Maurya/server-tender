const express = require('express');
const router = express.Router();
const CategoryController = require('../controllers/category.controller');
const { protect } = require('../middlewares/auth.middleware');


router.use(protect);


router.get('/tender', CategoryController.getTenderCategories);


router.post('/tender', CategoryController.createTenderCategory);


router.put('/tender/:id', CategoryController.updateTenderCategory);


router.delete('/tender/:id', CategoryController.deleteTenderCategory);

module.exports = router;
