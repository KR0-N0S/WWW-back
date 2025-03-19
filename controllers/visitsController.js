const pool = require('../db');

exports.getAllVisits = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM visits');
    res.json(result.rows);
  } catch (error) {
    console.error('Błąd pobierania wizyt:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.getVisitById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM visits WHERE id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Wizyta nie znaleziona' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Błąd pobierania wizyty:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.createVisit = async (req, res) => {
  const { farmer_id, vet_id, visit_date, description, status, employee_id, channel } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO visits (
         farmer_id, vet_id, visit_date, description, status, employee_id, channel
       ) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [farmer_id, vet_id, visit_date, description, status, employee_id, channel]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Błąd tworzenia wizyty:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.updateVisit = async (req, res) => {
  const { id } = req.params;
  const { farmer_id, vet_id, visit_date, description, status, employee_id, channel } = req.body;
  try {
    const result = await pool.query(
      `UPDATE visits SET farmer_id=$1, vet_id=$2, visit_date=$3, description=$4, status=$5, employee_id=$6, channel=$7
       WHERE id=$8 RETURNING *`,
      [farmer_id, vet_id, visit_date, description, status, employee_id, channel, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Wizyta nie znaleziona' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Błąd aktualizacji wizyty:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.deleteVisit = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(`DELETE FROM visits WHERE id=$1 RETURNING *`, [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Wizyta nie znaleziona' });
    res.json({ message: 'Wizyta usunięta pomyślnie' });
  } catch (error) {
    console.error('Błąd usuwania wizyty:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
