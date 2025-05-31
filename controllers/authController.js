const User = require('../models/User');

exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const newUser = new User({ name, email, password, role });
    await newUser.save();
    res.status(201).json({ message: 'Benutzer erstellt', user: newUser });
  } catch (error) {
    res.status(500).json({ message: 'Fehler beim Erstellen', error });
  }
};
