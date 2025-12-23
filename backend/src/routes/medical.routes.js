const express = require('express');
const router = express.Router();
const medicalController = require('../controllers/medical.controller');
const authMiddleware = require('../middleware/auth.middleware');

// All routes require authentication
router.use(authMiddleware);

// GET /api/medical/:animalId - Get medical records for an animal
router.get('/:animalId', medicalController.getMedicalRecords);

// POST /api/medical - Add medical record (admin only)
router.post('/', medicalController.addMedicalRecord);

// PUT /api/medical/:id - Update medical record (admin only)
router.put('/:id', medicalController.updateMedicalRecord);

// DELETE /api/medical/:id - Delete medical record (admin only)
router.delete('/:id', medicalController.deleteMedicalRecord);

module.exports = router;

