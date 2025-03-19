const express = require('express');
const router = express.Router();
const semenController = require('../controllers/semenController');

/**
 * @swagger
 * tags:
 *   name: Semen Inventory
 *   description: Operacje na magazynie nasienia
 */

/**
 * @swagger
 * /api/semen:
 *   get:
 *     summary: Pobranie listy operacji magazynowych nasienia
 *     tags: [Semen Inventory]
 *     responses:
 *       200:
 *         description: Lista operacji magazynowych nasienia
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/SemenRecord'
 */
router.get('/', semenController.getAllSemen);

/**
 * @swagger
 * /api/semen/{id}:
 *   get:
 *     summary: Pobranie szczegółowych danych operacji magazynowej nasienia
 *     tags: [Semen Inventory]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Unikalny identyfikator operacji magazynowej
 *     responses:
 *       200:
 *         description: Szczegóły operacji magazynowej
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SemenRecord'
 *       404:
 *         description: Operacja magazynowa nie znaleziona
 */
router.get('/:id', semenController.getSemenById);

/**
 * @swagger
 * /api/semen:
 *   post:
 *     summary: Dodanie nowego wpisu o dostawie nasienia
 *     tags: [Semen Inventory]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SemenRecord'
 *     responses:
 *       201:
 *         description: Wpis o dostawie nasienia został dodany
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SemenRecord'
 *       400:
 *         description: Błąd walidacji danych
 */
router.post('/', semenController.createSemenRecord);

/**
 * @swagger
 * /api/semen/{id}:
 *   put:
 *     summary: Aktualizacja wpisu o dostawie nasienia
 *     tags: [Semen Inventory]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Unikalny identyfikator operacji magazynowej
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SemenRecord'
 *     responses:
 *       200:
 *         description: Wpis został zaktualizowany
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SemenRecord'
 *       400:
 *         description: Błąd walidacji danych
 *       404:
 *         description: Operacja magazynowa nie znaleziona
 */
router.put('/:id', semenController.updateSemenRecord);

/**
 * @swagger
 * /api/semen/{id}:
 *   delete:
 *     summary: Usunięcie wpisu o dostawie nasienia
 *     tags: [Semen Inventory]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Unikalny identyfikator operacji magazynowej
 *     responses:
 *       200:
 *         description: Wpis został usunięty
 *       404:
 *         description: Operacja magazynowa nie znaleziona
 */
router.delete('/:id', semenController.deleteSemenRecord);

module.exports = router;
