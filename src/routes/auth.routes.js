const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/refresh', (req, res) => authController.refresh(req, res));

module.exports = router;
