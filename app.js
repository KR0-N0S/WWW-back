require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit'); // Importujemy rate limiter
const app = express();
const { body, validationResult } = require('express-validator');

// Middleware globalne
app.use(express.json());
app.use(cors());

// Ustawienie limitu zapytań: 100 zapytań na 15 minut dla każdego IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minut
  max: 100, // Limit 100 zapytań
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

// Rejestracja routerów (endpointy publiczne)
app.use('/api/auth', authRoutes);

// Dla operacji wymagających autoryzacji – przykładowy middleware JWT
const { verifyToken } = require('./middleware/authMiddleware');
app.use('/api/animals', verifyToken, animalsRoutes);
app.use('/api/bulls', verifyToken, bullsRoutes);
app.use('/api/insemination', verifyToken, inseminationRoutes);
app.use('/api/semen', verifyToken, semenRoutes);
app.use('/api/visits', verifyToken, visitsRoutes);
app.use('/api/keys', verifyToken, keysRoutes);

// Middleware do obsługi błędów (na końcu)
const errorHandler = require('./middleware/errorHandler');
app.use(errorHandler);

// Integracja Swaggera
const { swaggerUi, specs } = require('./swagger');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Ustawienie portu
const PORT = process.env.PORT || 4000;

// Uruchom serwer tylko, gdy ten plik jest uruchamiany bezpośrednio
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Serwer działa na porcie ${PORT}`);
  });
}

module.exports = app;
