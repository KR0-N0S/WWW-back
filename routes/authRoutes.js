const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const authController = require('../controllers/authController');

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Rejestracja nowego użytkownika
 *     description: Rejestracja nowego użytkownika przy użyciu danych osobowych i logowania. Walidacja emaila i długości hasła jest przeprowadzana przy użyciu express-validator.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - first_name
 *               - last_name
 *             properties:
 *               first_name:
 *                 type: string
 *                 example: Jan
 *               last_name:
 *                 type: string
 *                 example: Kowalski
 *               email:
 *                 type: string
 *                 example: jan.kowalski@example.com
 *               password:
 *                 type: string
 *                 example: tajnehaslo
 *               role:
 *                 type: string
 *                 example: FARMER
 *               street:
 *                 type: string
 *                 example: Main Street
 *               house_number:
 *                 type: string
 *                 example: "12A"
 *               city:
 *                 type: string
 *                 example: Warsaw
 *               postal_code:
 *                 type: string
 *                 example: "00-001"
 *               tax_id:
 *                 type: string
 *                 example: "1234567890"
 *               status:
 *                 type: string
 *                 example: active
 *               farm_number:
 *                 type: string
 *                 example: FARM123
 *               additional_id:
 *                 type: string
 *                 example: ADD456
 *               vet_id:
 *                 type: integer
 *                 example: null
 *     responses:
 *       201:
 *         description: Użytkownik został pomyślnie zarejestrowany.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 email:
 *                   type: string
 *       400:
 *         description: Błąd walidacji lub użytkownik z tym adresem email już istnieje.
 *       500:
 *         description: Wewnętrzny błąd serwera.
 */
router.post('/register', [
  body('email').isEmail().withMessage('Podaj prawidłowy email'),
  body('password').isLength({ min: 6 }).withMessage('Hasło musi mieć co najmniej 6 znaków')
], authController.register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Logowanie użytkownika
 *     description: Uwierzytelnienie użytkownika na podstawie emaila i hasła. Zwraca token JWT oraz dane użytkownika.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: jan.kowalski@example.com
 *               password:
 *                 type: string
 *                 example: tajnehaslo
 *     responses:
 *       200:
 *         description: Użytkownik został pomyślnie zalogowany.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 user:
 *                   type: object
 *       401:
 *         description: Nieprawidłowe dane logowania.
 *       404:
 *         description: Użytkownik nie został znaleziony.
 *       500:
 *         description: Wewnętrzny błąd serwera.
 */
router.post('/login', authController.login);

module.exports = router;
