const express = require('express');
const router = express.Router();
const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const tenderRoutes = require('./tender.routes');
const categoryRoutes = require('./category.routes');
const projectTypeRoutes = require('./projectType.routes');
const documentRoutes = require('./documentRoutes');
const organizationRoutes = require('./organizationRoutes');

// Mount routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/tenders', tenderRoutes);
router.use('/categories', categoryRoutes);
router.use('/project-types', projectTypeRoutes);
router.use('/documents', documentRoutes);
router.use('/organizations', organizationRoutes);

// Health check route
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

module.exports = router;
