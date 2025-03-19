const pool = require('../db'); // Połączenie do bazy danych

// Tworzenie nowego klucza
const createKey = async (req, res) => {
  const { user_id, public_key, backup_encrypted_private_key } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO user_keys (user_id, public_key, backup_encrypted_private_key) VALUES ($1, $2, $3) RETURNING *',
      [user_id, public_key, backup_encrypted_private_key]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Błąd podczas tworzenia klucza:', error);
    res.status(500).json({ message: 'Błąd przy zapisywaniu klucza' });
  }
};

// Pobieranie klucza użytkownika
const getKey = async (req, res) => {
  const { user_id } = req.params;
  try {
    const result = await pool.query(
      'SELECT * FROM user_keys WHERE user_id = $1',
      [user_id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Klucz nie znaleziony' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Błąd podczas pobierania klucza:', error);
    res.status(500).json({ message: 'Błąd przy pobieraniu klucza' });
  }
};

// Aktualizacja klucza użytkownika
const updateKey = async (req, res) => {
  const { user_id } = req.params;
  const { public_key, backup_encrypted_private_key } = req.body;
  try {
    const result = await pool.query(
      `UPDATE user_keys
       SET public_key = $1, backup_encrypted_private_key = $2, created_at = now()
       WHERE user_id = $3 RETURNING *`,
      [public_key, backup_encrypted_private_key, user_id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Klucz nie znaleziony' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Błąd podczas aktualizacji klucza:', error);
    res.status(500).json({ message: 'Błąd przy aktualizacji klucza' });
  }
};

module.exports = {
  createKey,
  getKey,
  updateKey
};
