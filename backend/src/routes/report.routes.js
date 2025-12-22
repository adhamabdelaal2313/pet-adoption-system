const express = require('express');
const router = express.Router();
const reportController = require('../controllers/report.controller');
const authMiddleware = require('../middleware/auth.middleware');

// All reports require authentication
// GET /api/reports/adoption-rates
router.get('/adoption-rates', authMiddleware, reportController.getAdoptionRates);

// GET /api/reports/popular-breeds
router.get('/popular-breeds', authMiddleware, reportController.getPopularBreeds);

// GET /api/reports/waiting-times
router.get('/waiting-times', authMiddleware, reportController.getAverageWaitingTimes);

// GET /api/reports/health-status
router.get('/health-status', authMiddleware, reportController.getHealthStatusReport);

// GET /api/reports/shelter-performance
router.get('/shelter-performance', authMiddleware, reportController.getShelterPerformance);

// GET /api/reports/follow-ups
router.get('/follow-ups', authMiddleware, reportController.getFollowUpReport);

module.exports = router;

