const pool = require('../db');

exports.getAllAnimals = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM animals');
    res.json(result.rows);
  } catch (error) {
    console.error('Błąd pobierania zwierząt:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.getAnimalById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM animals WHERE id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Zwierzę nie znalezione' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Błąd pobierania zwierzęcia:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.createAnimal = async (req, res) => {
  const { owner_id, animal_number, age, sex, breed, photo } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO animals (owner_id, animal_number, age, sex, breed, photo) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [owner_id, animal_number, age, sex, breed, photo]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Błąd tworzenia zwierzęcia:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.updateAnimal = async (req, res) => {
  const { id } = req.params;
  const { owner_id, animal_number, age, sex, breed, photo } = req.body;
  try {
    const result = await pool.query(
      `UPDATE animals SET owner_id=$1, animal_number=$2, age=$3, sex=$4, breed=$5, photo=$6 WHERE id=$7 RETURNING *`,
      [owner_id, animal_number, age, sex, breed, photo, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Zwierzę nie znalezione' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Błąd aktualizacji zwierzęcia:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.deleteAnimal = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(`DELETE FROM animals WHERE id=$1 RETURNING *`, [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Zwierzę nie znalezione' });
    res.json({ message: 'Zwierzę usunięte pomyślnie' });
  } catch (error) {
    console.error('Błąd usuwania zwierzęcia:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
