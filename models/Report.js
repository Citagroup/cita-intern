// models/Report.js
const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema({
  employee: String,
  text: String,
  images: [String],
  documents: [String],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Report", reportSchema);
