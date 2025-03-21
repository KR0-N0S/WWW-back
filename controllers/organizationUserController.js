// Plik: /var/www/amicus-backend/controllers/organizationUserController.js
const db = require('../db');

// Pobierz wszystkie relacje w org, do której user ma dostęp (lub wszystkie, jeśli ADMIN).
exports.getAllRelations = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Dla uproszczenia zwrócimy wszystkie relacje w org, w których user jest OWNER lub EMPLOYEE
    // lub cokolwiek jest w organization_user. 
    // Bardziej restrykcyjnie: user może zobaczyć TYLKO relacje w organizacjach, do których należy.
    const query = `
      SELECT ou.*
      FROM organization_user ou
      JOIN organization_user ou2 ON ou2.organization_id = ou.organization_id
      WHERE ou2.user_id = $1
    `;
    const result = await db.query(query, [userId]);
    return res.json(result.rows);
  } catch (error) {
    next(error);
  }
};

exports.getRelationById = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    // Sprawdzamy, czy ta relacja dotyczy organizacji, do której user należy
    const query = `
      SELECT ou.*
      FROM organization_user ou
      JOIN organization_user ou2 ON ou2.organization_id = ou.organization_id
      WHERE ou.id = $1
        AND ou2.user_id = $2
    `;
    const result = await db.query(query, [id, userId]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Relation not found or not authorized' });
    }
    return res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

// Tylko np. OWNER danej organizacji może tworzyć nowe relacje (zatrudniać pracowników)
exports.createRelation = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { organization_id, newUserId, role } = req.body;
    // Sprawdzamy, czy userId jest OWNER w tej org
    const checkOwnerQuery = `
      SELECT 1
      FROM organization_user
      WHERE organization_id = $1
        AND user_id = $2
        AND role = 'OWNER'
    `;
    const ownerRes = await db.query(checkOwnerQuery, [organization_id, userId]);
    if (ownerRes.rowCount === 0) {
      return res.status(403).json({ message: 'Only OWNER can add new members' });
    }

    // Dodajemy nową relację
    const insertQuery = `
      INSERT INTO organization_user (organization_id, user_id, role)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const result = await db.query(insertQuery, [organization_id, newUserId, role]);
    return res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

// Zmiana roli
exports.updateRelation = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { role } = req.body;

    // Sprawdzamy, czy user jest OWNER w tej samej org
    const checkQuery = `
      SELECT ou.organization_id
      FROM organization_user ou
      JOIN organization_user ou2 ON ou2.organization_id = ou.organization_id
      WHERE ou.id = $1
        AND ou2.user_id = $2
        AND ou2.role = 'OWNER'
    `;
    const checkRes = await db.query(checkQuery, [id, userId]);
    if (checkRes.rowCount === 0) {
      return res.status(403).json({ message: 'Not authorized to change role' });
    }
    const orgId = checkRes.rows[0].organization_id;

    // Aktualizacja roli
    const updateQ = `
      UPDATE organization_user
      SET role = $1
      WHERE id = $2
      RETURNING *
    `;
    const updated = await db.query(updateQ, [role, id]);
    return res.json(updated.rows[0]);
  } catch (error) {
    next(error);
  }
};

// Usuwanie relacji (np. zwolnienie pracownika) – tylko OWNER
exports.deleteRelation = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    // Znajdź organization_id danej relacji
    const findOrgQ = `SELECT organization_id FROM organization_user WHERE id=$1`;
    const findRes = await db.query(findOrgQ, [id]);
    if (findRes.rowCount === 0) {
      return res.status(404).json({ message: 'Not found' });
    }
    const orgId = findRes.rows[0].organization_id;

    // Sprawdź, czy user jest OWNER w tej org
    const checkOwnerQ = `
      SELECT 1
      FROM organization_user
      WHERE organization_id=$1
        AND user_id=$2
        AND role='OWNER'
    `;
    const checkOwnerRes = await db.query(checkOwnerQ, [orgId, userId]);
    if (checkOwnerRes.rowCount === 0) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Usuń relację
    const deleteQ = `DELETE FROM organization_user WHERE id=$1`;
    await db.query(deleteQ, [id]);

    return res.status(204).send();
  } catch (error) {
    next(error);
  }
};
