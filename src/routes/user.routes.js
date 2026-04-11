const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { protect } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');

// All user routes are protected
router.use(protect);

router.get('/profile', userController.getProfile);
router.put('/profile', userController.updateProfile);

// Example of role based route
router.get('/admin-only', authorize('ADMIN'), (req, res) => {
  res.json({ message: 'Welcome Admin' });
});

module.exports = router;
