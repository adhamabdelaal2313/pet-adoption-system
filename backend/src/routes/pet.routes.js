const express = require('express');
const router = express.Router();
const petController = require('../controllers/pet.controller');
const authMiddleware = require('../middleware/auth.middleware');
const optionalAuthMiddleware = require('../middleware/optionalAuth.middleware');

router.get('/', optionalAuthMiddleware, petController.getAllPets);
router.get('/:id', petController.getPetById);
router.post('/', authMiddleware, petController.addPet);
router.put('/:id', authMiddleware, petController.updatePet);
router.delete('/:id', authMiddleware, petController.deletePet);

module.exports = router;

