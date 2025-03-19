// swagger.js
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'AmicusApp API',
      version: '1.0.0',
      description: 'Dokumentacja API dla aplikacji AmicusApp',
    },
    servers: [
      {
        url: 'http://83.150.236.135:4000',
      },
    ],
    components: {
      schemas: {
        Animal: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            owner_id: { type: 'integer', example: 1 },
            animal_number: { type: 'string', example: 'AN123456' },
            age: { type: 'integer', example: 24 },
            sex: { type: 'string', example: 'F' },
            breed: { type: 'string', example: 'Holstein' },
            photo: { type: 'string', example: 'https://example.com/cow.jpg' },
            created_at: { type: 'string', format: 'date-time', example: '2023-03-18T12:34:56Z' }
          }
        },
        Bull: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            identification_number: { type: 'string', example: 'US321013349' },
            vet_number: { type: 'string', example: 'VET98765' },
            breed: { type: 'string', example: 'Holstein' },
            semen_production_date: { type: 'string', format: 'date', example: '2023-06-15' },
            supplier: { type: 'string', example: 'ABS' },
            bull_type: { type: 'string', example: 'Dairy' },
            last_delivery_date: { type: 'string', format: 'date', example: '2023-11-20' },
            straws_last_delivery: { type: 'integer', example: 20 },
            current_straw_count: { type: 'integer', example: 15 },
            suggested_price: { type: 'number', example: 250.00 },
            additional_info: { type: 'string', example: 'Elite genetics' },
            favorite: { type: 'boolean', example: true },
            created_at: { type: 'string', format: 'date-time', example: '2023-06-15T12:34:56Z' }
          }
        },
        Insemination: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            animal_id: { type: 'integer', example: 1 },
            certificate_number: { type: 'string', example: 'KW12345' },
            file_number: { type: 'string', example: 'FK987' },
            procedure_number: { type: 'string', example: 'PZ876' },
            re_insemination: { type: 'string', example: 'YES' },
            procedure_date: { type: 'string', format: 'date', example: '2024-03-15' },
            herd_number: { type: 'string', example: 'HERD789' },
            herd_eval_number: { type: 'string', example: 'EV456' },
            dam_owner: { type: 'string', example: 'John Doe' },
            ear_tag_number: { type: 'string', example: 'PL654321' },
            last_calving_date: { type: 'string', format: 'date', example: '2023-12-10' },
            name: { type: 'string', example: 'Super Bull' },
            bull_type: { type: 'string', example: 'Meat' },
            supplier: { type: 'string', example: 'Cattle Genetics Ltd.' },
            inseminator: { type: 'string', example: 'Dr. Smith' },
            symlek_status: { type: 'string', example: 'OK' },
            symlek_responsibility: { type: 'string', example: 'Clinic' },
            created_at: { type: 'string', format: 'date-time', example: '2024-03-15T12:00:00Z' }
          }
        },
        SemenRecord: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            bull_id: { type: 'integer', example: 1 },
            delivery_date: { type: 'string', format: 'date', example: '2024-02-10' },
            delivered_quantity: { type: 'integer', example: 50 },
            current_quantity: { type: 'integer', example: 30 },
            operation_type: { type: 'string', example: 'DELIVERY' },
            remarks: { type: 'string', example: 'High-quality frozen semen' },
            created_at: { type: 'string', format: 'date-time', example: '2024-02-10T10:00:00Z' }
          }
        },
        Visit: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            farmer_id: { type: 'integer', example: 1 },
            vet_id: { type: 'integer', example: 2 },
            visit_date: { type: 'string', format: 'date-time', example: '2024-04-10T10:00:00Z' },
            description: { type: 'string', example: 'General checkup' },
            status: { type: 'string', example: 'SCHEDULED' },
            employee_id: { type: 'integer', example: 5 },
            channel: { type: 'string', example: 'ONLINE' },
            created_at: { type: 'string', format: 'date-time', example: '2024-04-10T10:00:00Z' }
          }
        },
        Key: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            user_id: { type: 'integer', example: 1 },
            public_key: { type: 'string', example: 'samplePublicKey' },
            backup_encrypted_private_key: { type: 'string', example: 'sampleEncryptedKey' },
            created_at: { type: 'string', format: 'date-time', example: '2024-04-10T10:00:00Z' }
          }
        }
      },
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    }
  },
  apis: ['./routes/*.js', './controllers/*.js'], // lub inne ścieżki
};

const specs = swaggerJsdoc(options);

module.exports = { swaggerUi, specs };
