const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const connectDB = require('./config/db'); // DB-Verbindung

dotenv.config(); // .env laden

const app = express();
connectDB(); // DB verbinden

app.use(cors());
app.use(express.json());

// Fehler abfangen bei ungültigem JSON
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ message: 'Ungültiges JSON-Format' });
  }
  next();
});

// 🔐 User-Modell
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ['admin', 'mitarbeiter'], default: 'mitarbeiter' },
});
const User = mongoose.model('User', userSchema);

// 🔒 Token-Middleware
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
  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'E-Mail ist bereits registriert' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({ name, email, password: hashedPassword, role });
    res.status(201).json({ message: 'Registrierung erfolgreich', user: { name, email, role } });
  } catch (err) {
    res.status(400).json({ message: 'Fehler bei der Registrierung', error: err.message });
  }
});

// 🔐 Login
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'Benutzer nicht gefunden' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Falsches Passwort' });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });
    res.json({ token, user: { name: user.name, role: user.role, id: user._id } });
  } catch (err) {
    res.status(500).json({ message: 'Login-Fehler', error: err.message });
  }
});

// 👤 Eigene Daten abrufen
app.get('/api/me', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'Benutzer nicht gefunden' });
    res.json({ name: user.name, email: user.email, role: user.role });
  } catch (err) {
    res.status(500).json({ message: 'Fehler beim Abrufen', error: err.message });
  }
});

// 🚀 Server starten
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server läuft auf Port ${PORT}`));
