const express = require('express');
const router = express.Router();
const animalsController = require('../controllers/animalsController');

/**
 * @swagger
 * tags:
 *   name: Animals
 *   description: Zarządzanie zwierzętami
 */

/**
 * @swagger
 * /api/animals:
 *   get:
 *     summary: Pobranie listy zwierząt
 *     tags: [Animals]
 *     responses:
 *       200:
 *         description: Lista zwierząt
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Animal'
 */
router.get('/', animalsController.getAllAnimals);

/**
 * @swagger
 * /api/animals/{id}:
 *   get:
 *     summary: Pobranie szczegółowych danych zwierzęcia
 *     tags: [Animals]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Unikalny identyfikator zwierzęcia
 *     responses:
 *       200:
 *         description: Szczegóły zwierzęcia
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Animal'
 *       404:
 *         description: Zwierzę nie znalezione
 */
router.get('/:id', animalsController.getAnimalById);

/**
 * @swagger
 * /api/animals:
 *   post:
 *     summary: Dodanie nowego zwierzęcia
 *     tags: [Animals]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Animal'
 *     responses:
 *       201:
 *         description: Zwierzę zostało dodane
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Animal'
 *       400:
 *         description: Błąd walidacji danych
 */
router.post('/', animalsController.createAnimal);

/**
 * @swagger
 * /api/animals/{id}:
 *   put:
 *     summary: Aktualizacja danych zwierzęcia
 *     tags: [Animals]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Unikalny identyfikator zwierzęcia
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Animal'
 *     responses:
 *       200:
 *         description: Zwierzę zostało zaktualizowane
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Animal'
 *       400:
 *         description: Błąd walidacji danych
 *       404:
 *         description: Zwierzę nie znalezione
 */
router.put('/:id', animalsController.updateAnimal);

/**
 * @swagger
 * /api/animals/{id}:
 *   delete:
 *     summary: Usunięcie zwierzęcia
 *     tags: [Animals]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Unikalny identyfikator zwierzęcia
 *     responses:
 *       200:
 *         description: Zwierzę zostało usunięte
 *       404:
 *         description: Zwierzę nie znalezione
 */
router.delete('/:id', animalsController.deleteAnimal);

module.exports = router;
