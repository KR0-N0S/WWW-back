const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// GET /api/users/search?search=...&limit=...
router.get('/search', userController.searchUsers);

// GET /api/users/:id
router.get('/:id', userController.getUserById);

// PATCH /api/users/:id
router.patch('/:id', userController.updateUser);

// DELETE /api/users/:id
router.delete('/:id', userController.deleteUser);

module.exports = router;
