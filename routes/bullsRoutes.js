const express = require('express');
const router = express.Router();
const bullsController = require('../controllers/bullsController');

/**
 * @swagger
 * tags:
 *   name: Bulls
 *   description: Zarządzanie buhajami
 */

/**
 * @swagger
 * /api/bulls:
 *   get:
 *     summary: Pobranie listy buhajów
 *     tags: [Bulls]
 *     responses:
 *       200:
 *         description: Lista buhajów
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Bull'
 */
router.get('/', bullsController.getAllBulls);

/**
 * @swagger
 * /api/bulls/{id}:
 *   get:
 *     summary: Pobranie szczegółowych danych buhaja
 *     tags: [Bulls]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Unikalny identyfikator buhaja
 *     responses:
 *       200:
 *         description: Szczegóły buhaja
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Bull'
 *       404:
 *         description: Buhaj nie znaleziony
 */
router.get('/:id', bullsController.getBullById);

/**
 * @swagger
 * /api/bulls:
 *   post:
 *     summary: Dodanie nowego buhaja
 *     tags: [Bulls]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Bull'
 *     responses:
 *       201:
 *         description: Buhaj został dodany
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Bull'
 *       400:
 *         description: Błąd walidacji danych
 */
router.post('/', bullsController.createBull);

/**
 * @swagger
 * /api/bulls/{id}:
 *   put:
 *     summary: Aktualizacja danych buhaja
 *     tags: [Bulls]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Unikalny identyfikator buhaja
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Bull'
 *     responses:
 *       200:
 *         description: Buhaj został zaktualizowany
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Bull'
 *       400:
 *         description: Błąd walidacji danych
 *       404:
 *         description: Buhaj nie znaleziony
 */
router.put('/:id', bullsController.updateBull);

/**
 * @swagger
 * /api/bulls/{id}:
 *   delete:
 *     summary: Usunięcie buhaja
 *     tags: [Bulls]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Unikalny identyfikator buhaja
 *     responses:
 *       200:
 *         description: Buhaj został usunięty
 *       404:
 *         description: Buhaj nie znaleziony
 */
router.delete('/:id', bullsController.deleteBull);

module.exports = router;
