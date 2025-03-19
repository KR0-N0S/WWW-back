const pool = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

exports.register = async (req, res) => {
  // Walidacja danych – przykładowe użycie express-validator
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const {
    first_name,
    last_name,
    email,
    password,
    role,
    street,
    house_number,
    city,
    postal_code,
    tax_id,
    status,
    farm_number,
    additional_id,
    vet_id
  } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO users (
         first_name, last_name, email, password, role,
         street, house_number, city, postal_code, tax_id,
         status, farm_number, additional_id, vet_id
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
       RETURNING *`,
      [
        first_name,
        last_name,
        email,
        hashedPassword,
        role,
        street,
        house_number,
        city,
        postal_code,
        tax_id,
        status,
        farm_number,
        additional_id,
        vet_id
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Błąd rejestracji:', error.message);
    // Sprawdzenie błędu unikalności (duplikatu emaila)
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Użytkownik z tym adresem email już istnieje.' });
    }
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Użytkownik nie znaleziony' });
    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: 'Nieprawidłowe dane logowania' });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    res.json({ token, user });
  } catch (error) {
    console.error('Błąd logowania:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
