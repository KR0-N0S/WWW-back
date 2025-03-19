const express = require('express');
const router = express.Router();
const visitsController = require('../controllers/visitsController');

/**
 * @swagger
 * tags:
 *   name: Visits
 *   description: Zarządzanie wizytami weterynaryjnymi
 */

/**
 * @swagger
 * /api/visits:
 *   get:
 *     summary: Pobranie listy wizyt
 *     tags: [Visits]
 *     responses:
 *       200:
 *         description: Lista wizyt
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Visit'
 */
router.get('/', visitsController.getAllVisits);

/**
 * @swagger
 * /api/visits/{id}:
 *   get:
 *     summary: Pobranie szczegółowych danych wizyty
 *     tags: [Visits]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Unikalny identyfikator wizyty
 *     responses:
 *       200:
 *         description: Szczegóły wizyty
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Visit'
 *       404:
 *         description: Wizyta nie znaleziona
 */
router.get('/:id', visitsController.getVisitById);

/**
 * @swagger
 * /api/visits:
 *   post:
 *     summary: Dodanie nowej wizyty
 *     tags: [Visits]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Visit'
 *     responses:
 *       201:
 *         description: Wizyta została dodana
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Visit'
 *       400:
 *         description: Błąd walidacji danych
 */
router.post('/', visitsController.createVisit);

/**
 * @swagger
 * /api/visits/{id}:
 *   put:
 *     summary: Aktualizacja danych wizyty
 *     tags: [Visits]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Unikalny identyfikator wizyty
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Visit'
 *     responses:
 *       200:
 *         description: Wizyta została zaktualizowana
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Visit'
 *       400:
 *         description: Błąd walidacji danych
 *       404:
 *         description: Wizyta nie znaleziona
 */
router.put('/:id', visitsController.updateVisit);

/**
 * @swagger
 * /api/visits/{id}:
 *   delete:
 *     summary: Usunięcie wizyty
 *     tags: [Visits]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Unikalny identyfikator wizyty
 *     responses:
 *       200:
 *         description: Wizyta została usunięta
 *       404:
 *         description: Wizyta nie znaleziona
 */
router.delete('/:id', visitsController.deleteVisit);

module.exports = router;
