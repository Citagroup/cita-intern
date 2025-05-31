const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const connectDB = require('./config/db'); // ← auslagern der DB-Verbindung

const app = express();
dotenv.config();
connectDB(); // ← DB verbinden

app.use(cors());
app.use(express.json());

// Mongoose-Modul erst nach Verbindung verwenden
const mongoose = require('mongoose');

// 🔐 User-Modell
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ['admin', 'mitarbeiter'], default: 'mitarbeiter' },
});
const User = mongoose.model('User', userSchema);

// 🔒 Middleware zur Token-Prüfung
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Token fehlt' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ message: 'Token ungültig' });
  }
};

// 📩 Registrierung
app.post('/api/register', async (req, res) => {
  const { name, email, password, role } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    const newUser = await User.create({ name, email, password: hashedPassword, role });
    res.status(201).json(newUser);
  } catch (err) {
    res.status(400).json({ message: 'Fehler beim Registrieren', error: err });
  }
});

// 🔐 Login
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: 'Benutzer nicht gefunden' });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(401).json({ message: 'Falsches Passwort' });

  const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET);
  res.json({ token, user: { name: user.name, role: user.role, id: user._id } });
});

// 👤 Eigene Daten abrufen
app.get('/api/me', verifyToken, async (req, res) => {
  const user = await User.findById(req.user.id);
  res.json({ name: user.name, email: user.email, role: user.role });
});

// 🚀 Server starten
app.listen(process.env.PORT || 5000, () => console.log('Server läuft auf Port 5000'));
