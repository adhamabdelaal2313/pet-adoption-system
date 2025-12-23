const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/application.controller');
const authMiddleware = require('../middleware/auth.middleware');

// All routes require authentication
router.use(authMiddleware);

// GET /api/applications - Get all applications (admin) or user's applications
router.get('/', applicationController.getApplications);

// GET /api/applications/:id - Get single application
router.get('/:id', applicationController.getApplicationById);

// POST /api/applications - Submit new adoption application
router.post('/', applicationController.submitApplication);

// PUT /api/applications/:id - Update application status (admin only)
router.put('/:id', applicationController.updateApplicationStatus);

// GET /api/applications/:id/follow-ups - Get follow-ups for an application
router.get('/:id/follow-ups', applicationController.getFollowUps);

// POST /api/applications/:id/follow-ups - Add follow-up (admin only)
router.post('/:id/follow-ups', applicationController.addFollowUp);

module.exports = router;

