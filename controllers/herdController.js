// Plik: /var/www/amicus-backend/controllers/herdController.js
const db = require('../db');

/**
 * Użytkownik widzi stado, jeśli:
 *  - owner_type='USER' i owner_id = user.id, LUB
 *  - owner_type='ORGANIZATION' i owner_id należy do organizacji, w której user jest przypisany
 */

// GET /api/herds
// Zwraca wszystkie stada, do których user ma dostęp
exports.getAllHerds = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const query = `
      SELECT h.*
      FROM herds h
      WHERE
        (owner_type='USER' AND owner_id=$1)
        OR (
          owner_type='ORGANIZATION'
          AND owner_id IN (
            SELECT organization_id
            FROM organization_user
            WHERE user_id=$1
          )
        )
    `;
    const result = await db.query(query, [userId]);
    return res.json(result.rows);
  } catch (error) {
    next(error);
  }
};

// GET /api/herds/:id
exports.getHerdById = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const query = `
      SELECT h.*
      FROM herds h
      WHERE h.id=$1
        AND (
          (owner_type='USER' AND owner_id=$2)
          OR (
            owner_type='ORGANIZATION'
            AND owner_id IN (
              SELECT organization_id
              FROM organization_user
              WHERE user_id=$2
            )
          )
        )
    `;
    const result = await db.query(query, [id, userId]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Herd not found or not authorized' });
    }
    return res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

// POST /api/herds
// Tworzymy stado - np. user przypisuje sobie stado, lub org przypisuje stado
exports.createHerd = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { herd_id, owner_type, owner_id } = req.body;

    // Walidacja: jeśli owner_type='USER', to owner_id musi == userId
    // Jeśli owner_type='ORGANIZATION', user musi należeć do tej org
    if (owner_type === 'USER') {
      if (parseInt(owner_id) !== userId) {
        return res.status(403).json({ message: 'Cannot create herd for another user' });
      }
    } else if (owner_type === 'ORGANIZATION') {
      const checkOrgQ = `
        SELECT 1
        FROM organization_user
        WHERE organization_id=$1
          AND user_id=$2
      `;
      const checkOrgRes = await db.query(checkOrgQ, [owner_id, userId]);
      if (checkOrgRes.rowCount === 0) {
        return res.status(403).json({ message: 'Not authorized to create herd for this organization' });
      }
    } else {
      return res.status(400).json({ message: 'Invalid owner_type' });
    }

    // Wstawiamy rekord do herds
    const insertQ = `
      INSERT INTO herds (herd_id, owner_type, owner_id)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const result = await db.query(insertQ, [herd_id, owner_type, owner_id]);
    return res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

// PATCH /api/herds/:id
// Zmiana np. owner_id, herd_id
exports.updateHerd = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { herd_id, owner_type, owner_id } = req.body;

    // Najpierw sprawdzamy, czy user ma dostęp do stada
    const checkQ = `
      SELECT *
      FROM herds
      WHERE id=$1
        AND (
          (owner_type='USER' AND owner_id=$2)
          OR (
            owner_type='ORGANIZATION'
            AND owner_id IN (
              SELECT organization_id
              FROM organization_user
              WHERE user_id=$2
            )
          )
        )
    `;
    const checkRes = await db.query(checkQ, [id, userId]);
    if (checkRes.rowCount === 0) {
      return res.status(404).json({ message: 'Not found or not authorized' });
    }

    // Jeśli chcesz zmienić owner_type / owner_id, ponownie sprawdź uprawnienia
    // (analogicznie do createHerd)
    // ...

    const updateQ = `
      UPDATE herds
      SET herd_id=$1, owner_type=$2, owner_id=$3
      WHERE id=$4
      RETURNING *
    `;
    const result = await db.query(updateQ, [herd_id, owner_type, owner_id, id]);
    return res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

// DELETE /api/herds/:id
// Możesz usunąć stado, jeśli jesteś jego właścicielem (user) lub należysz do org
exports.deleteHerd = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const checkQ = `
      SELECT *
      FROM herds
      WHERE id=$1
        AND (
          (owner_type='USER' AND owner_id=$2)
          OR (
            owner_type='ORGANIZATION'
            AND owner_id IN (
              SELECT organization_id
              FROM organization_user
              WHERE user_id=$2
            )
          )
        )
    `;
    const checkRes = await db.query(checkQ, [id, userId]);
    if (checkRes.rowCount === 0) {
      return res.status(404).json({ message: 'Not found or not authorized' });
    }

    // Fizycznie usuwamy lub ewentualnie status = 'Inactive'
    const deleteQ = `DELETE FROM herds WHERE id=$1`;
    await db.query(deleteQ, [id]);
    return res.status(204).send();
  } catch (error) {
    next(error);
  }
};
