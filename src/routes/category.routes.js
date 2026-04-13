const express = require('express');
const router = express.Router();
const CategoryController = require('../controllers/category.controller');

// GET all active categories
router.get('/tender', CategoryController.getTenderCategories);

// POST new category
router.post('/tender', CategoryController.createTenderCategory);

// PUT update category
router.put('/tender/:id', CategoryController.updateTenderCategory);

// DELETE (soft) category
router.delete('/tender/:id', CategoryController.deleteTenderCategory);

module.exports = router;
