module.exports = (err, req, res, next) => {
  console.error('Centralny błąd:', err);
  res.status(500).json({ error: 'Wewnętrzny błąd serwera' });
};
