const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  name: String,
  date: String,
  description: String,
  img: String,
  baiduLink: String
}, { timestamps: true });

const Document = mongoose.model('Document', documentSchema);

module.exports = Document;