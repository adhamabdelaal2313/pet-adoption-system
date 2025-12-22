const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const authMiddleware = require('../middleware/auth.middleware');

// GET /api/admin/breeds - Get all breeds
router.get('/breeds', authMiddleware, adminController.getBreeds);

// GET /api/admin/shelters - Get all shelters
router.get('/shelters', authMiddleware, adminController.getShelters);

module.exports = router;

