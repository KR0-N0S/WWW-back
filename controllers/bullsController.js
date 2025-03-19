const pool = require('../db');

exports.getAllBulls = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM bulls');
    res.json(result.rows);
  } catch (error) {
    console.error('Błąd pobierania buhajów:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.getBullById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM bulls WHERE id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Buhaj nie znaleziony' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Błąd pobierania buhaja:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.createBull = async (req, res) => {
  const {
    identification_number,
    vet_number,
    breed,
    semen_production_date,
    supplier,
    bull_type,
    last_delivery_date,
    straws_last_delivery,
    current_straw_count,
    suggested_price,
    additional_info,
    favorite
  } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO bulls (
         identification_number, vet_number, breed, semen_production_date, supplier, bull_type, 
         last_delivery_date, straws_last_delivery, current_straw_count, suggested_price, additional_info, favorite
       ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`,
      [
        identification_number,
        vet_number,
        breed,
        semen_production_date,
        supplier,
        bull_type,
        last_delivery_date,
        straws_last_delivery,
        current_straw_count,
        suggested_price,
        additional_info,
        favorite
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Błąd tworzenia buhaja:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.updateBull = async (req, res) => {
  const { id } = req.params;
  const {
    identification_number,
    vet_number,
    breed,
    semen_production_date,
    supplier,
    bull_type,
    last_delivery_date,
    straws_last_delivery,
    current_straw_count,
    suggested_price,
    additional_info,
    favorite
  } = req.body;
  try {
    const result = await pool.query(
      `UPDATE bulls SET identification_number=$1, vet_number=$2, breed=$3, semen_production_date=$4, supplier=$5,
         bull_type=$6, last_delivery_date=$7, straws_last_delivery=$8, current_straw_count=$9, suggested_price=$10,
         additional_info=$11, favorite=$12 WHERE id=$13 RETURNING *`,
      [
        identification_number,
        vet_number,
        breed,
        semen_production_date,
        supplier,
        bull_type,
        last_delivery_date,
        straws_last_delivery,
        current_straw_count,
        suggested_price,
        additional_info,
        favorite,
        id
      ]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Buhaj nie znaleziony' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Błąd aktualizacji buhaja:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.deleteBull = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(`DELETE FROM bulls WHERE id=$1 RETURNING *`, [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Buhaj nie znaleziony' });
    res.json({ message: 'Buhaj usunięty pomyślnie' });
  } catch (error) {
    console.error('Błąd usuwania buhaja:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
