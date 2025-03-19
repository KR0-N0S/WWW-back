const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const keysController = require('../controllers/keysController');

/**
 * @swagger
 * tags:
 *   name: Keys
 *   description: Zarządzanie kluczami użytkowników
 */

/**
 * @swagger
 * /api/keys:
 *   post:
 *     summary: Utworzenie nowego klucza użytkownika
 *     tags: [Keys]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_id
 *               - public_key
 *             properties:
 *               user_id:
 *                 type: integer
 *                 example: 1
 *               public_key:
 *                 type: string
 *                 example: samplePublicKey
 *               backup_encrypted_private_key:
 *                 type: string
 *                 example: sampleEncryptedKey
 *     responses:
 *       201:
 *         description: Klucz został utworzony
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Key'
 *       400:
 *         description: Błąd walidacji danych
 *       401:
 *         description: Brak autoryzacji
 */
router.post('/', authMiddleware.verifyToken, keysController.createKey);

/**
 * @swagger
 * /api/keys/{user_id}:
 *   get:
 *     summary: Pobranie klucza użytkownika
 *     tags: [Keys]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Unikalny identyfikator użytkownika
 *     responses:
 *       200:
 *         description: Klucz użytkownika
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Key'
 *       404:
 *         description: Klucz nie znaleziony
 *       401:
 *         description: Brak autoryzacji
 */
router.get('/:user_id', authMiddleware.verifyToken, keysController.getKey);

/**
 * @swagger
 * /api/keys/{user_id}:
 *   put:
 *     summary: Aktualizacja klucza użytkownika
 *     tags: [Keys]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Unikalny identyfikator użytkownika
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               public_key:
 *                 type: string
 *                 example: updatedPublicKey
 *               backup_encrypted_private_key:
 *                 type: string
 *                 example: updatedEncryptedKey
 *     responses:
 *       200:
 *         description: Klucz został zaktualizowany
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Key'
 *       404:
 *         description: Klucz nie znaleziony
 *       401:
 *         description: Brak autoryzacji
 */
router.put('/:user_id', authMiddleware.verifyToken, keysController.updateKey);

module.exports = router;

