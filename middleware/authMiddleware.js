module.exports = (req, res, next) => {
  // Beispiel: einfache Authentifizierung prüfen
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ message: 'Nicht autorisiert' });
  }
  // Logik für Token-Prüfung kann hier ergänzt werden
  next();
};
