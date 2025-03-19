const pool = require('../db');

exports.getAllSemen = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM semen_inventory');
    res.json(result.rows);
  } catch (error) {
    console.error('Błąd pobierania wpisów magazynu nasienia:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.getSemenById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM semen_inventory WHERE id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Rekord nie znaleziony' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Błąd pobierania rekordu nasienia:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.createSemenRecord = async (req, res) => {
  const { bull_id, delivery_date, delivered_quantity, current_quantity, operation_type, remarks } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO semen_inventory (
         bull_id, delivery_date, delivered_quantity, current_quantity, operation_type, remarks
       ) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [bull_id, delivery_date, delivered_quantity, current_quantity, operation_type, remarks]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Błąd tworzenia rekordu magazynu nasienia:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.updateSemenRecord = async (req, res) => {
  const { id } = req.params;
  const { bull_id, delivery_date, delivered_quantity, current_quantity, operation_type, remarks } = req.body;
  try {
    const result = await pool.query(
      `UPDATE semen_inventory SET bull_id=$1, delivery_date=$2, delivered_quantity=$3, current_quantity=$4, operation_type=$5, remarks=$6
       WHERE id=$7 RETURNING *`,
      [bull_id, delivery_date, delivered_quantity, current_quantity, operation_type, remarks, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Rekord nie znaleziony' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Błąd aktualizacji rekordu magazynu nasienia:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.deleteSemenRecord = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(`DELETE FROM semen_inventory WHERE id=$1 RETURNING *`, [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Rekord nie znaleziony' });
    res.json({ message: 'Rekord magazynu nasienia usunięty pomyślnie' });
  } catch (error) {
    console.error('Błąd usuwania rekordu magazynu nasienia:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
