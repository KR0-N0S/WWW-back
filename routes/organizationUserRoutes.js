// Plik: /var/www/amicus-backend/routes/organizationUserRoutes.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/organizationUserController');

// GET /api/organization-user
router.get('/', ctrl.getAllRelations);

// GET /api/organization-user/:id
router.get('/:id', ctrl.getRelationById);

// POST /api/organization-user
router.post('/', ctrl.createRelation);

// PATCH /api/organization-user/:id
router.patch('/:id', ctrl.updateRelation);

// DELETE /api/organization-user/:id
router.delete('/:id', ctrl.deleteRelation);

module.exports = router;
