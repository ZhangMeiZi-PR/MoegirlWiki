const Document = require('../models/documentModel');

const handleDocAll = (req, res) => {
  Document.find()
    .then(doc => res.json(doc))
    .catch(err => res.status(500).json({ error: err.message }));
};

const handleDocId = (req, res) => {
  const id = req.params.id;
  Document.findById(id)
    .then(doc => res.json(doc))
    .catch(err => res.status(500).json({ error: err.message }));
};

const handleDocImgName = (req, res) => {
  Document.find()
    .select('name img')
    .then(doc => res.json(doc))
    .catch(err => res.status(500).json({ error: err.message }));
};

const handleDocPost = (req, res) => {
  const imagePath = `/images/${req.file.filename}`;
  const { name, date, description, baiduLink } = req.body;
  const document = new Document({
    ...req.body,
    img: imagePath
  });
  document.save()
    .then(result => res.status(201).json(result))
    .catch(err => res.status(500).json({ error: err.message })); 
};

const handleDocDelete = (req, res) => {
  const id = req.params.id;
  Document.findByIdAndDelete(id)
    .then(result => res.status(201).json(result))
    .catch(err => res.status(500).json({ error: err.message }));
};

module.exports = { handleDocAll, handleDocId, handleDocImgName, handleDocPost, handleDocDelete };



