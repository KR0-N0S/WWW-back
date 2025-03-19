const jwt = require('jsonwebtoken');

exports.verifyToken = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) {
    return res.status(401).json({ error: 'Brak tokenu autoryzacyjnego' });
  }
  // Zakładamy, że token przesyłany jest jako "Bearer <token>"
  const parts = token.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ error: 'Nieprawidłowy format tokenu' });
  }
  jwt.verify(parts[1], process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Token nieprawidłowy lub wygasł' });
    }
    req.user = decoded;
    next();
  });
};
