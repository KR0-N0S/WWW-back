const pool = require('../db');

exports.getAllInseminations = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM insemination_register');
    res.json(result.rows);
  } catch (error) {
    console.error('Błąd pobierania inseminacji:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.getInseminationById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM insemination_register WHERE id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Rekord inseminacji nie znaleziony' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Błąd pobierania rekordu inseminacji:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.createInsemination = async (req, res) => {
  const {
    animal_id,
    certificate_number,
    file_number,
    procedure_number,
    re_insemination,
    procedure_date,
    herd_number,
    herd_eval_number,
    dam_owner,
    ear_tag_number,
    last_calving_date,
    name,
    bull_type,
    supplier,
    inseminator,
    symlek_status,
    symlek_responsibility
  } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO insemination_register (
         animal_id, certificate_number, file_number, procedure_number, re_insemination, procedure_date,
         herd_number, herd_eval_number, dam_owner, ear_tag_number, last_calving_date,
         name, bull_type, supplier, inseminator, symlek_status, symlek_responsibility
       ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17) RETURNING *`,
      [
        animal_id,
        certificate_number,
        file_number,
        procedure_number,
        re_insemination,
        procedure_date,
        herd_number,
        herd_eval_number,
        dam_owner,
        ear_tag_number,
        last_calving_date,
        name,
        bull_type,
        supplier,
        inseminator,
        symlek_status,
        symlek_responsibility
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Błąd tworzenia rekordu inseminacji:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.updateInsemination = async (req, res) => {
  const { id } = req.params;
  const {
    animal_id,
    certificate_number,
    file_number,
    procedure_number,
    re_insemination,
    procedure_date,
    herd_number,
    herd_eval_number,
    dam_owner,
    ear_tag_number,
    last_calving_date,
    name,
    bull_type,
    supplier,
    inseminator,
    symlek_status,
    symlek_responsibility
  } = req.body;
  try {
    const result = await pool.query(
      `UPDATE insemination_register SET animal_id=$1, certificate_number=$2, file_number=$3, procedure_number=$4, 
         re_insemination=$5, procedure_date=$6, herd_number=$7, herd_eval_number=$8, dam_owner=$9, ear_tag_number=$10,
         last_calving_date=$11, name=$12, bull_type=$13, supplier=$14, inseminator=$15, symlek_status=$16, symlek_responsibility=$17
         WHERE id=$18 RETURNING *`,
      [
        animal_id,
        certificate_number,
        file_number,
        procedure_number,
        re_insemination,
        procedure_date,
        herd_number,
        herd_eval_number,
        dam_owner,
        ear_tag_number,
        last_calving_date,
        name,
        bull_type,
        supplier,
        inseminator,
        symlek_status,
        symlek_responsibility,
        id
      ]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Rekord inseminacji nie znaleziony' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Błąd aktualizacji rekordu inseminacji:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.deleteInsemination = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(`DELETE FROM insemination_register WHERE id=$1 RETURNING *`, [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Rekord inseminacji nie znaleziony' });
    res.json({ message: 'Rekord inseminacji usunięty pomyślnie' });
  } catch (error) {
    console.error('Błąd usuwania rekordu inseminacji:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
