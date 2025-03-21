// Plik: /var/www/amicus-backend/routes/organizationRoutes.js
const express = require('express');
const router = express.Router();
const organizationController = require('../controllers/organizationController');

// GET /api/organizations
router.get('/', organizationController.getAllOrganizations);

// GET /api/organizations/:id
router.get('/:id', organizationController.getOrganizationById);

// POST /api/organizations
router.post('/', organizationController.createOrganization);

// PATCH /api/organizations/:id
router.patch('/:id', organizationController.updateOrganization);

// DELETE /api/organizations/:id
router.delete('/:id', organizationController.deleteOrganization);

module.exports = router;
