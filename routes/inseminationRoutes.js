const express = require('express');
const router = express.Router();
const inseminationController = require('../controllers/inseminationController');

/**
 * @swagger
 * tags:
 *   name: Insemination
 *   description: Rejestracja operacji inseminacji
 */

/**
 * @swagger
 * /api/insemination:
 *   get:
 *     summary: Pobranie listy wpisów inseminacji
 *     tags: [Insemination]
 *     responses:
 *       200:
 *         description: Lista wpisów inseminacji
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Insemination'
 */
router.get('/', inseminationController.getAllInseminations);

/**
 * @swagger
 * /api/insemination/{id}:
 *   get:
 *     summary: Pobranie szczegółowych danych wpisu inseminacji
 *     tags: [Insemination]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Unikalny identyfikator wpisu inseminacji
 *     responses:
 *       200:
 *         description: Szczegóły wpisu inseminacji
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Insemination'
 *       404:
 *         description: Wpis inseminacji nie znaleziony
 */
router.get('/:id', inseminationController.getInseminationById);

/**
 * @swagger
 * /api/insemination:
 *   post:
 *     summary: Dodanie nowego wpisu inseminacji
 *     tags: [Insemination]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Insemination'
 *     responses:
 *       201:
 *         description: Wpis inseminacji został dodany
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Insemination'
 *       400:
 *         description: Błąd walidacji danych
 */
router.post('/', inseminationController.createInsemination);

/**
 * @swagger
 * /api/insemination/{id}:
 *   put:
 *     summary: Aktualizacja wpisu inseminacji
 *     tags: [Insemination]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Unikalny identyfikator wpisu inseminacji
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Insemination'
 *     responses:
 *       200:
 *         description: Wpis inseminacji został zaktualizowany
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Insemination'
 *       400:
 *         description: Błąd walidacji danych
 *       404:
 *         description: Wpis inseminacji nie znaleziony
 */
router.put('/:id', inseminationController.updateInsemination);

/**
 * @swagger
 * /api/insemination/{id}:
 *   delete:
 *     summary: Usunięcie wpisu inseminacji
 *     tags: [Insemination]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Unikalny identyfikator wpisu inseminacji
 *     responses:
 *       200:
 *         description: Wpis inseminacji został usunięty
 *       404:
 *         description: Wpis inseminacji nie znaleziony
 */
router.delete('/:id', inseminationController.deleteInsemination);

module.exports = router;
