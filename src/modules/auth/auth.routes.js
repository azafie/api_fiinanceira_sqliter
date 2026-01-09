const express = require('express');
const router = express.Router();
const authController = require('./auth.controller');
const { authMiddleware } = require('../../middlewares/auth.middleware');

// Rotas públicas
router.post('/login', authController.login);
router.post('/refresh', authController.refresh);
router.post('/register', authController.register);

// Rotas protegidas
router.post('/logout', authMiddleware, authController.logout);
router.post('/logout-all', authMiddleware, authController.logoutAll);
router.get('/profile', authMiddleware, authController.getProfile);

module.exports = router;