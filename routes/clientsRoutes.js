const express = require('express');
const router = express.Router();
const { createClient } = require('../controllers/clientsController');
const { verifyToken } = require('../middleware/authMiddleware');

// POST /api/clients
router.post('/', verifyToken, createClient);

module.exports = router;
