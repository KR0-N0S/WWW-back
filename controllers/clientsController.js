// Plik: /var/www/amicus-backend/controllers/clientsController.js

const db = require('../db');
const bcrypt = require('bcryptjs');

/**
 * createClient - tworzy nowego usera (klienta).
 * - Generuje losowe hasło i zapisuje je w kolumnie `password` (zahashowane).
 * - Jeśli hasCompany=true, tworzy też organizację i przypisuje usera jako OWNER.
 * - Jeśli herd_id jest podane, sprawdza unikalność i tworzy wpis w herds.
 */
exports.createClient = async (req, res) => {
  const {
    first_name,
    last_name,
    email,
    phone,
    hasCompany,
    orgName,
    orgStreet,
    orgCity,
    orgPostalCode,
    orgTaxId,
    herd_id
  } = req.body;

  // Minimalna walidacja wymaganych pól usera
  if (!first_name || !last_name) {
    return res.status(400).json({ message: 'Imię i nazwisko są wymagane' });
  }

  // 1. Wygeneruj losowe hasło (np. 8 znaków)
  const randomPassword = Math.random().toString(36).slice(-8);

  // 2. Zrób hash hasła (bcrypt) - 10 rund soli
  const hashedPassword = bcrypt.hashSync(randomPassword, 10);

  // Przygotowanie danych usera
  const client = {
    first_name,
    last_name,
    email: email || null,
    phone: phone || null,
    status: 'Active',
    password: hashedPassword // hashowane hasło
  };

  const connection = await db.connect();
  try {
    await connection.query('BEGIN');

    // 3. Tworzymy usera w tabeli `users` (uwzględniając `password`)
    const userInsert = `
      INSERT INTO users (first_name, last_name, email, phone, status, password)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id
    `;
    const userRes = await connection.query(userInsert, [
      client.first_name,
      client.last_name,
      client.email,
      client.phone,
      client.status,
      client.password
    ]);
    const newUserId = userRes.rows[0].id;

    let newOrgId = null;
    if (hasCompany) {
      // Sprawdzamy, czy nazwa organizacji jest podana
      if (!orgName) {
        throw { status: 400, message: 'Nazwa firmy (orgName) jest wymagana, gdy hasCompany=true' };
      }

      // 4. Tworzymy organizację
      const orgInsert = `
        INSERT INTO organizations (name, street, house_number, city, postal_code, tax_id, status)
        VALUES ($1, $2, '', $3, $4, $5, 'Active')
        RETURNING id
      `;
      // orgStreet może zawierać ulicę i nr – w razie potrzeby rozbij to na osobne kolumny
      const orgRes = await connection.query(orgInsert, [
        orgName,
        orgStreet || '',
        orgCity || '',
        orgPostalCode || '',
        orgTaxId || ''
      ]);
      newOrgId = orgRes.rows[0].id;

      // Dodaj relację w organization_user (OWNER)
      const relInsert = `
        INSERT INTO organization_user (organization_id, user_id, role)
        VALUES ($1, $2, 'OWNER')
      `;
      await connection.query(relInsert, [newOrgId, newUserId]);
    }

    // 5. Jeśli herd_id nie jest pusty, sprawdzamy unikalność i tworzymy stado
    if (herd_id && herd_id.trim() !== '') {
      // Sprawdź, czy stado już istnieje
      const herdCheck = `
        SELECT id FROM herds
        WHERE herd_id = $1
      `;
      const herdCheckRes = await connection.query(herdCheck, [herd_id.trim()]);
      if (herdCheckRes.rowCount > 0) {
        // Już istnieje -> błąd 409 Conflict
        throw { status: 409, message: 'Stado o tym numerze już istnieje!' };
      }

      // Wstaw nowe stado
      const insertHerd = `
        INSERT INTO herds (herd_id, owner_type, owner_id)
        VALUES ($1, $2, $3)
      `;
      if (hasCompany) {
        // owner_type='ORGANIZATION'
        await connection.query(insertHerd, [herd_id.trim(), 'ORGANIZATION', newOrgId]);
      } else {
        // owner_type='USER'
        await connection.query(insertHerd, [herd_id.trim(), 'USER', newUserId]);
      }
    }

    await connection.query('COMMIT');

    // 6. Zwracamy surowe hasło (randomPassword), by można je było przekazać użytkownikowi
    return res.status(201).json({
      message: 'Utworzono klienta (user) pomyślnie',
      user_id: newUserId,
      organization_id: newOrgId,
      rawPassword: randomPassword // UWAGA: w produkcji zwykle nie pokazuje się surowego hasła
    });
  } catch (error) {
    await connection.query('ROLLBACK');
    console.error('Błąd tworzenia klienta:', error);

    const statusCode = error.status || 400; // domyślnie 400
    return res.status(statusCode).json({ message: error.message || 'Błąd przy tworzeniu klienta' });
  } finally {
    connection.release();
  }
};
