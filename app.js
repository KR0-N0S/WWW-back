// Plik: /var/www/amicus-backend/app.js

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const app = express();
const { body, validationResult } = require('express-validator');

app.use(express.json());
app.use(cors());

// Limit zapytań
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again after 15 minutes"
});
app.use(limiter);

// Import routerów
const authRoutes = require('./routes/authRoutes');
const animalsRoutes = require('./routes/animalsRoutes');
const bullsRoutes = require('./routes/bullsRoutes');
const inseminationRoutes = require('./routes/inseminationRoutes');
const semenRoutes = require('./routes/semenRoutes');
const visitsRoutes = require('./routes/visitsRoutes');
const keysRoutes = require('./routes/keysRoutes');
const userRoutes = require('./routes/userRoutes');

// NOWE routery:
const organizationRoutes = require('./routes/organizationRoutes');
const organizationUserRoutes = require('./routes/organizationUserRoutes');
const herdRoutes = require('./routes/herdRoutes');

// *** DODANE: router do obsługi klientów ***
const clientsRoutes = require('./routes/clientsRoutes');  // <-- NOWA linia

// Rejestracja routerów (endpointy publiczne)
app.use('/api/auth', authRoutes);

// Middleware JWT
const { verifyToken } = require('./middleware/authMiddleware');
app.use('/api/animals', verifyToken, animalsRoutes);
app.use('/api/bulls', verifyToken, bullsRoutes);
app.use('/api/insemination', verifyToken, inseminationRoutes);
app.use('/api/semen', verifyToken, semenRoutes);
app.use('/api/visits', verifyToken, visitsRoutes);
app.use('/api/keys', verifyToken, keysRoutes);
app.use('/api/users', verifyToken, userRoutes);

// Rejestracja NOWYCH tras z zabezpieczeniem
app.use('/api/organizations', verifyToken, organizationRoutes);
app.use('/api/organization-user', verifyToken, organizationUserRoutes);
app.use('/api/herds', verifyToken, herdRoutes);

// *** DODANE: rejestracja /api/clients ***
app.use('/api/clients', verifyToken, clientsRoutes);  // <-- NOWA linia

// Middleware do obsługi błędów
const errorHandler = require('./middleware/errorHandler');
app.use(errorHandler);

// Swagger
const { swaggerUi, specs } = require('./swagger');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Uruchomienie serwera
const PORT = process.env.PORT || 4000;
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Serwer działa na porcie ${PORT}`);
  });
}

module.exports = app;

