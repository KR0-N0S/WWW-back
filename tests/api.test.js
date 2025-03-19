const request = require('supertest');
const chai = require('chai');
const expect = chai.expect;
const app = require('../app');
const jwt = require('jsonwebtoken');

describe('API Integration Tests', function() {
  let token;
  let userId;
  let animalId;            // Dla testów Animals
  let inseminationAnimalId; // Dla testów inseminacji
  let bullId;              // Dla testów Bulls / Semen
  let inseminationId;
  let semenId;
  let visitId;
  
  // Generowanie unikalnego adresu email, aby uniknąć duplikatów
  const randomSuffix = Math.floor(Math.random() * 10000);
  const testUser = {
    first_name: "Test",
    last_name: "User",
    email: `test.user${randomSuffix}@example.com`,
    password: "testpassword",
    role: "FARMER", // Możesz dodać też użytkownika z rolą EMPLOYEE, jeśli potrzebujesz
    street: "Test Street",
    house_number: "1A",
    city: "TestCity",
    postal_code: "00-000",
    tax_id: "1234567890",
    status: "active",
    farm_number: "FARMTEST",
    additional_id: "ADDTEST",
    vet_id: null
  };

  before(async function() {
    // Rejestracja i logowanie użytkownika
    let res = await request(app)
      .post('/api/auth/register')
      .send(testUser)
      .set('Accept', 'application/json');
    expect(res.status).to.equal(201);
    userId = res.body.id;

    res = await request(app)
      .post('/api/auth/login')
      .send({ email: testUser.email, password: testUser.password })
      .set('Accept', 'application/json');
    expect(res.status).to.equal(200);
    token = res.body.token;

    // Utwórz dodatkowe zwierzę do testów inseminacji, aby mieć pewność, że rekord istnieje
    res = await request(app)
      .post('/api/animals')
      .set('Authorization', `Bearer ${token}`)
      .send({
        owner_id: userId,
        animal_number: "AN_INSEMINATION",
        age: 36,
        sex: "F",
        breed: "Holstein",
        photo: "https://example.com/animal.jpg"
      });
    expect(res.status).to.equal(201);
    inseminationAnimalId = res.body.id;
  });

  describe('Animals Endpoints', function() {
    it('should create a new animal', async function() {
      const res = await request(app)
        .post('/api/animals')
        .set('Authorization', `Bearer ${token}`)
        .send({
          owner_id: userId,
          animal_number: "AN123456",
          age: 24,
          sex: "F",
          breed: "Holstein",
          photo: "https://example.com/cow.jpg"
        });
      expect(res.status).to.equal(201);
      expect(res.body).to.have.property('id');
      animalId = res.body.id;
    });

    it('should get list of animals', async function() {
      const res = await request(app)
        .get('/api/animals')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).to.equal(200);
      expect(res.body).to.be.an('array');
    });

    it('should get an animal by id', async function() {
      const res = await request(app)
        .get(`/api/animals/${animalId}`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('id', animalId);
    });

    it('should update an animal', async function() {
      const res = await request(app)
        .put(`/api/animals/${animalId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          owner_id: userId,
          animal_number: "AN654321",
          age: 30,
          sex: "F",
          breed: "Holstein",
          photo: "https://example.com/cow_new.jpg"
        });
      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('animal_number', "AN654321");
    });

    it('should delete an animal', async function() {
      const res = await request(app)
        .delete(`/api/animals/${animalId}`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).to.equal(200);
    });
  });

  describe('Bulls Endpoints', function() {
    it('should create a new bull', async function() {
      const res = await request(app)
        .post('/api/bulls')
        .set('Authorization', `Bearer ${token}`)
        .send({
          identification_number: "US321013349",
          vet_number: "VET98765",
          breed: "Holstein",
          semen_production_date: "2023-06-15",
          supplier: "ABS",
          bull_type: "Dairy",
          last_delivery_date: "2023-11-20",
          straws_last_delivery: 20,
          current_straw_count: 15,
          suggested_price: 250.00,
          additional_info: "Elite genetics",
          favorite: true
        });
      expect(res.status).to.equal(201);
      expect(res.body).to.have.property('id');
      bullId = res.body.id;
    });

    it('should get list of bulls', async function() {
      const res = await request(app)
        .get('/api/bulls')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).to.equal(200);
      expect(res.body).to.be.an('array');
    });

    it('should get a bull by id', async function() {
      const res = await request(app)
        .get(`/api/bulls/${bullId}`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('id', bullId);
    });

    it('should update a bull', async function() {
      const res = await request(app)
        .put(`/api/bulls/${bullId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          identification_number: "US321013350",
          vet_number: "VET98765",
          breed: "Holstein",
          semen_production_date: "2023-06-15",
          supplier: "ABS",
          bull_type: "Dairy",
          last_delivery_date: "2023-11-21",
          straws_last_delivery: 22,
          current_straw_count: 17,
          suggested_price: 260.00,
          additional_info: "Elite genetics updated",
          favorite: false
        });
      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('identification_number', "US321013350");
    });

    // Nie usuwamy buhaja, ponieważ go wykorzystamy w testach Semen
  });

  describe('Insemination Endpoints', function() {
    it('should create a new insemination entry', async function() {
      const res = await request(app)
        .post('/api/insemination')
        .set('Authorization', `Bearer ${token}`)
        .send({
          animal_id: inseminationAnimalId, // Używamy wcześniej utworzonego zwierzęcia dla inseminacji
          certificate_number: "KW12345",
          file_number: "FK987",
          procedure_number: "PZ876",
          re_insemination: "YES",
          procedure_date: "2024-03-15",
          herd_number: "HERD789",
          herd_eval_number: "EV456",
          dam_owner: "John Doe",
          ear_tag_number: "PL654321",
          last_calving_date: "2023-12-10",
          name: "Super Insemination",
          bull_type: "Meat",
          supplier: "Cattle Genetics Ltd.",
          inseminator: "Dr. Smith",
          symlek_status: "OK",
          symlek_responsibility: "Clinic"
        });
      expect(res.status).to.equal(201);
      expect(res.body).to.have.property('id');
      inseminationId = res.body.id;
    });

    it('should get list of insemination entries', async function() {
      const res = await request(app)
        .get('/api/insemination')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).to.equal(200);
      expect(res.body).to.be.an('array');
    });

    it('should get an insemination entry by id', async function() {
      const res = await request(app)
        .get(`/api/insemination/${inseminationId}`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('id', inseminationId);
    });

    it('should update an insemination entry', async function() {
      const res = await request(app)
        .put(`/api/insemination/${inseminationId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          animal_id: inseminationAnimalId,
          certificate_number: "KW12346",
          file_number: "FK988",
          procedure_number: "PZ877",
          re_insemination: "NO",
          procedure_date: "2024-03-16",
          herd_number: "HERD790",
          herd_eval_number: "EV457",
          dam_owner: "Jane Doe",
          ear_tag_number: "PL654322",
          last_calving_date: "2023-12-11",
          name: "Super Insemination Updated",
          bull_type: "Meat",
          supplier: "Cattle Genetics Ltd.",
          inseminator: "Dr. Smith",
          symlek_status: "OK",
          symlek_responsibility: "Clinic"
        });
      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('certificate_number', "KW12346");
    });

    it('should delete an insemination entry', async function() {
      const res = await request(app)
        .delete(`/api/insemination/${inseminationId}`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).to.equal(200);
    });
  });

  describe('Semen Inventory Endpoints', function() {
    it('should create a new semen record', async function() {
      const res = await request(app)
        .post('/api/semen')
        .set('Authorization', `Bearer ${token}`)
        .send({
          bull_id: bullId, // używamy istniejącego buhaja
          delivery_date: "2024-02-10",
          delivered_quantity: 50,
          current_quantity: 30,
          operation_type: "DELIVERY",
          remarks: "High-quality frozen semen"
        });
      expect(res.status).to.equal(201);
      expect(res.body).to.have.property('id');
      semenId = res.body.id;
    });

    it('should get list of semen records', async function() {
      const res = await request(app)
        .get('/api/semen')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).to.equal(200);
      expect(res.body).to.be.an('array');
    });

    it('should get a semen record by id', async function() {
      const res = await request(app)
        .get(`/api/semen/${semenId}`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('id', semenId);
    });

    it('should update a semen record', async function() {
      const res = await request(app)
        .put(`/api/semen/${semenId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          bull_id: bullId,
          delivery_date: "2024-02-11",
          delivered_quantity: 60,
          current_quantity: 35,
          operation_type: "DELIVERY",
          remarks: "Updated semen record"
        });
      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('delivered_quantity', 60);
    });

    it('should delete a semen record', async function() {
      const res = await request(app)
        .delete(`/api/semen/${semenId}`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).to.equal(200);
    });
  });

  describe('Visits Endpoints', function() {
    it('should create a new visit', async function() {
      // Używamy userId jako farmera oraz jako pracownika, zakładając, że to ten sam użytkownik
      const res = await request(app)
        .post('/api/visits')
        .set('Authorization', `Bearer ${token}`)
        .send({
          farmer_id: userId,
          vet_id: 2, // upewnij się, że taki rekord istnieje lub zmodyfikuj
          visit_date: "2024-04-10T10:00:00Z",
          description: "General checkup",
          status: "SCHEDULED",
          employee_id: userId, // używamy userId, by nie powodować błędu z kluczem obcym
          channel: "ONLINE"
        });
      expect(res.status).to.equal(201);
      expect(res.body).to.have.property('id');
      visitId = res.body.id;
    });

    it('should get list of visits', async function() {
      const res = await request(app)
        .get('/api/visits')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).to.equal(200);
      expect(res.body).to.be.an('array');
    });

    it('should get a visit by id', async function() {
      const res = await request(app)
        .get(`/api/visits/${visitId}`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('id', visitId);
    });

    it('should update a visit', async function() {
      const res = await request(app)
        .put(`/api/visits/${visitId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          farmer_id: userId,
          vet_id: 2,
          visit_date: "2024-04-10T11:00:00Z",
          description: "General checkup updated",
          status: "COMPLETED",
          employee_id: userId,
          channel: "ONLINE"
        });
      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('description', "General checkup updated");
    });

    it('should delete a visit', async function() {
      const res = await request(app)
        .delete(`/api/visits/${visitId}`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).to.equal(200);
    });
  });

  describe('Keys Endpoints', function() {
    it('should create a new key entry', async function() {
      const res = await request(app)
        .post('/api/keys')
        .set('Authorization', `Bearer ${token}`)
        .send({
          user_id: userId,
          public_key: "samplePublicKey",
          backup_encrypted_private_key: "sampleEncryptedKey"
        });
      expect(res.status).to.equal(201);
      expect(res.body).to.have.property('id');
    });

    it('should get the key for the given user', async function() {
      const res = await request(app)
        .get(`/api/keys/${userId}`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('public_key', "samplePublicKey");
    });

    it('should update the key for the given user', async function() {
      const res = await request(app)
        .put(`/api/keys/${userId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          public_key: "updatedPublicKey",
          backup_encrypted_private_key: "updatedEncryptedKey"
        });
      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('public_key', "updatedPublicKey");
    });
  });
});
