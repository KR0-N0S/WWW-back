// Plik: /var/www/amicus-backend/routes/herdRoutes.js
const express = require('express');
const router = express.Router();
const herdController = require('../controllers/herdController');

// GET /api/herds
router.get('/', herdController.getAllHerds);

// GET /api/herds/:id
router.get('/:id', herdController.getHerdById);

// POST /api/herds
router.post('/', herdController.createHerd);

// PATCH /api/herds/:id
router.patch('/:id', herdController.updateHerd);

// DELETE /api/herds/:id
router.delete('/:id', herdController.deleteHerd);

module.exports = router;
