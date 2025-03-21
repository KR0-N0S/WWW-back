// Plik: /var/www/amicus-backend/controllers/organizationController.js
const db = require('../db');

// Właściciel/pracownik organizacji widzi TYLKO organizacje, w których jest w organization_user.
// Zwykły user (niebędący w żadnej org) nie zobaczy żadnej.
exports.getAllOrganizations = async (req, res, next) => {
  try {
    const userId = req.user.id;
    // Pobieramy wszystkie org, do których user ma przypisanie w organization_user
    const query = `
      SELECT o.*
      FROM organizations o
      JOIN organization_user ou ON ou.organization_id = o.id
      WHERE ou.user_id = $1
        AND o.status = 'Active'
    `;
    const result = await db.query(query, [userId]);
    return res.json(result.rows);
  } catch (error) {
    next(error);
  }
};

exports.getOrganizationById = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const query = `
      SELECT o.*
      FROM organizations o
      JOIN organization_user ou ON ou.organization_id = o.id
      WHERE o.id = $1
        AND ou.user_id = $2
        AND o.status = 'Active'
      LIMIT 1
    `;
    const result = await db.query(query, [id, userId]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Organization not found or not authorized' });
    }
    return res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

// Tworzenie nowej organizacji (np. gdy ktoś zakłada gabinet)
exports.createOrganization = async (req, res, next) => {
  try {
    const userId = req.user.id; // Twórca może być od razu OWNER
    const { name, street, house_number, city, postal_code, tax_id } = req.body;

    // Dodajemy org do bazy
    const insertOrgQuery = `
      INSERT INTO organizations (name, street, house_number, city, postal_code, tax_id, status)
      VALUES ($1, $2, $3, $4, $5, $6, 'Active')
      RETURNING id, name, street, house_number, city, postal_code, tax_id, status
    `;
    const orgResult = await db.query(insertOrgQuery, [name, street, house_number, city, postal_code, tax_id]);
    const newOrg = orgResult.rows[0];

    // Dodajemy relację w organization_user (OWNER)
    const insertRelQuery = `
      INSERT INTO organization_user (organization_id, user_id, role)
      VALUES ($1, $2, 'OWNER')
    `;
    await db.query(insertRelQuery, [newOrg.id, userId]);

    return res.status(201).json(newOrg);
  } catch (error) {
    next(error);
  }
};

// Aktualizacja danych organizacji (może to zrobić np. OWNER lub EMPLOYEE z uprawnieniami –
// tu przykładowo zakładamy, że każdy w org ma prawo edycji).
exports.updateOrganization = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { name, street, house_number, city, postal_code, tax_id } = req.body;

    // Sprawdzamy, czy user ma dostęp do tej org
    const checkQuery = `
      SELECT 1
      FROM organizations o
      JOIN organization_user ou ON ou.organization_id = o.id
      WHERE o.id = $1
        AND ou.user_id = $2
        AND o.status = 'Active'
    `;
    const checkRes = await db.query(checkQuery, [id, userId]);
    if (checkRes.rowCount === 0) {
      return res.status(404).json({ message: 'Not found or not authorized' });
    }

    const updateQuery = `
      UPDATE organizations
      SET name = $1, street = $2, house_number = $3, city = $4, postal_code = $5, tax_id = $6
      WHERE id = $7
      RETURNING id, name, street, house_number, city, postal_code, tax_id, status
    `;
    const updated = await db.query(updateQuery, [name, street, house_number, city, postal_code, tax_id, id]);
    return res.json(updated.rows[0]);
  } catch (error) {
    next(error);
  }
};

// Soft delete - ustawia status='Inactive'
exports.deleteOrganization = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    // Sprawdzamy, czy user w ogóle należy do tej org
    const checkQuery = `
      SELECT 1
      FROM organizations o
      JOIN organization_user ou ON ou.organization_id = o.id
      WHERE o.id = $1
        AND ou.user_id = $2
        AND o.status = 'Active'
    `;
    const checkRes = await db.query(checkQuery, [id, userId]);
    if (checkRes.rowCount === 0) {
      return res.status(404).json({ message: 'Not found or not authorized' });
    }

    // Ustawiamy status na Inactive
    const deleteQuery = `
      UPDATE organizations
      SET status = 'Inactive'
      WHERE id = $1
    `;
    await db.query(deleteQuery, [id]);
    return res.status(204).send();
  } catch (error) {
    next(error);
  }
};
