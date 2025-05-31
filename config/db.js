const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB verbunden');
  } catch (err) {
    console.error('❌ Fehler bei der DB-Verbindung:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
