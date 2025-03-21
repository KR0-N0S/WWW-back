const db = require('../db');

/**
 * Funkcja pomocnicza:
 * Zwraca listę (organization_id, rola_w_tej_org) dla zalogowanego usera.
 */
async function getUserOrganizations(userId) {
  const query = `
    SELECT organization_id, role
    FROM organization_user
    WHERE user_id = $1
  `;
  const result = await db.query(query, [userId]);
  return result.rows; // tablica obiektów { organization_id, role }
}

/**
 * Sprawdza, czy user ma w swojej organizacji rolę co najmniej "EMPLOYEE" lub "OWNER".
 * Zwraca obiekt np. { canEditAnyRole: true/false, canEditFarmerOnly: true/false, orgIdList: [...] }
 */
async function getOrgPermissions(userId) {
  const orgs = await getUserOrganizations(userId);
  // Przykład: user jest w org 1 jako OWNER, w org 2 jako EMPLOYEE
  // => Może edytować w org 1 dowolną rolę, w org 2 tylko FARMER
  // Dla uproszczenia – jeśli jest OWNER w którejś organizacji, ma uprawnienia "owner" w niej.

  const ownerOrgs = orgs.filter(o => o.role === 'OWNER').map(o => o.organization_id);
  const employeeOrgs = orgs.filter(o => o.role === 'EMPLOYEE').map(o => o.organization_id);

  return {
    ownerOrgIds: ownerOrgs,       // tam, gdzie user jest OWNER
    employeeOrgIds: employeeOrgs, // tam, gdzie user jest EMPLOYEE
  };
}

/**
 * 1. WYSZUKIWANIE UŻYTKOWNIKÓW (searchUsers)
 *    - Zwracamy wyłącznie userów, którzy należą do organizacji, w której jest zalogowany user.
 *    - Jeśli user nie należy do żadnej organizacji, może wyszukiwać tylko siebie (opcjonalnie).
 */
exports.searchUsers = async (req, res, next) => {
  try {
    const userId = req.user.id;  // z tokenu
    const { search = '', limit = 10 } = req.query;
    const searchPattern = `%${search}%`;

    // Sprawdzamy, do jakich organizacji user należy
    const orgs = await getUserOrganizations(userId);
    if (orgs.length === 0) {
      // user nie należy do żadnej organizacji -> np. zwraca tylko siebie?
      // Można też zwrócić pustą tablicę, zależy od wymagań
      const selfQuery = `
        SELECT *
        FROM users
        WHERE id=$1
          AND (first_name ILIKE $2 OR last_name ILIKE $2 OR city ILIKE $2)
        LIMIT $3
      `;
      const selfRes = await db.query(selfQuery, [userId, searchPattern, limit]);
      return res.json(selfRes.rows);
    }

    // user jest w co najmniej jednej organizacji
    // Szukamy wszystkich userów, którzy są w co najmniej jednej z tych organizacji
    const orgIds = orgs.map(o => o.organization_id);
    // Tworzymy listę parametrow do zapytania: (orgIds) w klauzuli IN
    const inParams = orgIds.map((_, i) => `$${i + 2}`).join(', '); // np. $2, $3, ...
    // Pierwszy parametr to searchPattern, ostatni to limit
    // => paramy: [searchPattern, orgId1, orgId2, ..., limitParam]
    const params = [searchPattern, ...orgIds, limit];

    const query = `
      SELECT u.*
      FROM users u
      JOIN organization_user ou ON ou.user_id = u.id
      WHERE ou.organization_id IN (${inParams})
        AND (u.first_name ILIKE $1 OR u.last_name ILIKE $1 OR u.city ILIKE $1)
      LIMIT $${orgIds.length + 2}
    `;
    // Przykład: "SELECT u.* FROM users u JOIN organization_user ou ON ou.user_id=u.id
    //            WHERE ou.organization_id IN ($2, $3, ...)
    //            AND (u.first_name ILIKE $1 OR ...)
    //            LIMIT $X"

    const result = await db.query(query, params);
    return res.json(result.rows);
  } catch (error) {
    console.error('Błąd wyszukiwania użytkowników:', error);
    next(error);
  }
};

/**
 * 2. POBIERANIE DANYCH JEDNEGO USERA
 *    - User może pobrać swoje dane,
 *    - Albo user z organizacji, do której należy ten user (jeśli jest w tej samej org).
 */
exports.getUserById = async (req, res, next) => {
  try {
    const currentUserId = req.user.id;
    const { id } = req.params;

    // Jeśli to ten sam user -> OK
    if (parseInt(id) === currentUserId) {
      const self = await db.query("SELECT * FROM users WHERE id=$1", [id]);
      if (self.rowCount === 0) {
        return res.status(404).json({ message: 'User not found' });
      }
      return res.json(self.rows[0]);
    }

    // Inaczej sprawdzamy, czy currentUser i user {id} są w tej samej organizacji
    const orgsCurrent = await getUserOrganizations(currentUserId);
    const orgsTargetQ = `
      SELECT organization_id
      FROM organization_user
      WHERE user_id = $1
    `;
    const orgsTarget = await db.query(orgsTargetQ, [id]);

    // Sprawdzamy, czy istnieje co najmniej jedna wspólna organizacja
    const currentOrgIds = orgsCurrent.map(o => o.organization_id);
    const targetOrgIds = orgsTarget.rows.map(r => r.organization_id);
    const intersection = currentOrgIds.filter(orgId => targetOrgIds.includes(orgId));
    if (intersection.length === 0) {
      return res.status(403).json({ message: 'Not authorized to see this user' });
    }

    // OK, są w tej samej org -> pobieramy usera
    const userRes = await db.query("SELECT * FROM users WHERE id=$1", [id]);
    if (userRes.rowCount === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    return res.json(userRes.rows[0]);
  } catch (error) {
    next(error);
  }
};

/**
 * 3. AKTUALIZACJA DANYCH USERA
 *    - Każdy user może edytować tylko swoje dane,
 *    - Użytkownik z organizacji (EMPLOYEE/OWNER) może edytować dane innego usera, jeśli:
 *      - Należy do tej samej organizacji,
 *      - 'EMPLOYEE' może edytować tylko usera z rolą 'FARMER',
 *      - 'OWNER' może edytować dowolnego usera w organizacji.
 */
exports.updateUser = async (req, res, next) => {
  try {
    const currentUserId = req.user.id;
    const { id } = req.params;
    const { first_name, last_name, city, role } = req.body; // przykładowe pola do edycji

    // 3.1. Jeśli user edytuje sam siebie
    if (parseInt(id) === currentUserId) {
      // user może zmienić np. first_name, last_name, city, ale nie role (chyba że chcesz)
      // w tym przykładzie zablokujemy zmianę roli samego siebie
      const updateQ = `
        UPDATE users
        SET first_name=$1, last_name=$2, city=$3
        WHERE id=$4
        RETURNING *
      `;
      const updated = await db.query(updateQ, [first_name, last_name, city, id]);
      return res.json(updated.rows[0]);
    }

    // 3.2. Inaczej – sprawdzamy, czy currentUser i targetUser są w tej samej organizacji
    //      i czy currentUser ma rolę EMPLOYEE lub OWNER w tej organizacji
    const { ownerOrgIds, employeeOrgIds } = await getOrgPermissions(currentUserId);

    // Znajdź organizacje targetUsera
    const targetOrgsQ = `
      SELECT organization_id, role as target_role
      FROM organization_user
      JOIN users ON users.id = organization_user.user_id
      WHERE user_id = $1
    `;
    const targetOrgsRes = await db.query(targetOrgsQ, [id]);
    if (targetOrgsRes.rowCount === 0) {
      return res.status(403).json({ message: 'Target user not in any organization or not authorized' });
    }

    // Sprawdzamy wspólne organizacje
    const targetOrgIds = targetOrgsRes.rows.map(r => r.organization_id);
    const intersectionOwner = targetOrgIds.filter(orgId => ownerOrgIds.includes(orgId));
    const intersectionEmployee = targetOrgIds.filter(orgId => employeeOrgIds.includes(orgId));

    // Czy jest jakakolwiek organizacja, w której currentUser jest OWNER lub EMPLOYEE
    // i jednocześnie targetUser też tam jest?
    if (intersectionOwner.length === 0 && intersectionEmployee.length === 0) {
      return res.status(403).json({ message: 'Not in the same organization or no permission' });
    }

    // 3.2.1. Jeśli currentUser jest OWNER w co najmniej jednej organizacji wspólnej z targetUserem,
    //        może edytować wszystko (np. role).
    let canEditAnyRole = (intersectionOwner.length > 0);

    // 3.2.2. Jeśli jest tylko EMPLOYEE, to sprawdzamy, czy targetUser ma role='FARMER'.
    //        Bo EMPLOYEE może edytować tylko FARMERA.
    if (!canEditAnyRole && intersectionEmployee.length > 0) {
      // Sprawdzamy, czy docelowy user ma rolę 'FARMER'
      // (trzeba pobrać z `users` lub z dołączonej kolumny w zapytaniu)
      const targetUserQ = `SELECT role FROM users WHERE id=$1`;
      const tRes = await db.query(targetUserQ, [id]);
      if (tRes.rowCount === 0) {
        return res.status(404).json({ message: 'Target user not found' });
      }
      const targetRole = tRes.rows[0].role;
      if (targetRole !== 'FARMER') {
        return res.status(403).json({ message: 'EMPLOYEE can only edit FARMER' });
      }
    }

    // 3.3. Wykonujemy UPDATE
    // Zakładamy, że OWNER może zmienić też role, a EMPLOYEE – nie.
    let updateQ, updateParams;
    if (canEditAnyRole) {
      // OWNER może zmieniać np. role
      updateQ = `
        UPDATE users
        SET first_name=$1, last_name=$2, city=$3, role=$4
        WHERE id=$5
        RETURNING *
      `;
      updateParams = [first_name, last_name, city, role, id];
    } else {
      // EMPLOYEE -> nie może zmienić role, ale może zmienić first_name, last_name, city
      updateQ = `
        UPDATE users
        SET first_name=$1, last_name=$2, city=$3
        WHERE id=$4
        RETURNING *
      `;
      updateParams = [first_name, last_name, city, id];
    }

    const updated = await db.query(updateQ, updateParams);
    return res.json(updated.rows[0]);
  } catch (error) {
    next(error);
  }
};

/**
 * 4. USUWANIE USERA (soft delete) - np. user usuwa swoje konto
 *    Lub OWNER usuwa usera z organizacji – w tym przykładzie zakładamy, że
 *    "deleteUser" ustawia status='Inactive' w tabeli `users`.
 */
exports.deleteUser = async (req, res, next) => {
  try {
    const currentUserId = req.user.id;
    const { id } = req.params;

    // Jeśli to sam user, OK – usuwa swoje konto
    if (parseInt(id) === currentUserId) {
      const delQ = `UPDATE users SET status='Inactive' WHERE id=$1`;
      await db.query(delQ, [id]);
      return res.status(204).send();
    }

    // Inaczej – sprawdzamy, czy jest OWNER w tej samej org co targetUser
    const { ownerOrgIds } = await getOrgPermissions(currentUserId);

    // Sprawdzamy org targetUsera
    const targetOrgsQ = `SELECT organization_id FROM organization_user WHERE user_id=$1`;
    const tOrgRes = await db.query(targetOrgsQ, [id]);
    if (tOrgRes.rowCount === 0) {
      return res.status(403).json({ message: 'Target user not in any org or not authorized' });
    }
    const targetOrgIds = tOrgRes.rows.map(r => r.organization_id);

    // Sprawdzamy intersection z ownerOrgIds
    const intersection = targetOrgIds.filter(orgId => ownerOrgIds.includes(orgId));
    if (intersection.length === 0) {
      return res.status(403).json({ message: 'Not authorized to delete this user' });
    }

    // OK, user jest OWNER w przynajmniej jednej wspólnej org
    const delQ = `UPDATE users SET status='Inactive' WHERE id=$1`;
    await db.query(delQ, [id]);
    return res.status(204).send();
  } catch (error) {
    next(error);
  }
};
