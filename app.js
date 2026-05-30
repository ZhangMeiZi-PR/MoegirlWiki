const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const multer = require('multer');
const Blog = require('./model/blog.js');
const Document = require('./model/document.js');
const path = require('path');

const app = express();

// middleware
app.use(cors()); // Frontend connect
app.use(express.json()); 
app.use('/images', express.static(path.join(__dirname, 'images')));

// multer middleware
const fileStorageEngine = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './images')
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '--' + file.originalname)
  },
})
const upload = multer({storage: fileStorageEngine})
//

app.use(morgan('dev'));

//connect to MongoDB
const dbURL = 'mongodb://JensenZ:20051118Zpr@ac-rsdbp93-shard-00-00.pbhj9aw.mongodb.net:27017,ac-rsdbp93-shard-00-01.pbhj9aw.mongodb.net:27017,ac-rsdbp93-shard-00-02.pbhj9aw.mongodb.net:27017/Test-01?ssl=true&replicaSet=atlas-123bre-shard-0&authSource=admin&appName=Test';

mongoose.connect(dbURL)
.then(() => {
  app.listen(5000)
})
.catch( err => console.log(err));


// API ROUTE

//GET
app.get('/api/blogs', (req, res) => {
  Blog.find()
    .sort({ createdAt: -1 })
    .then(blogs => res.json(blogs))
    .catch(err => res.status(500).json({ error: err.message }));
});

app.get('/api/blogs/recent',(req, res) => {
  Blog.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .then(blogs => res.json(blogs))
    .catch(err => res.status(500).json({ error: err.message }));
});

app.get('/api/blogs/:id', (req, res) => {
  const id = req.params.id;
  Blog.findById(id)
    .then(blog => res.json(blog))
    .catch(err => res.status(500).json({ error: err.message }));
});

app.get('/api/documents', (req, res) => {
  Document.find()
    .then(doc => res.json(doc))
    .catch(err => res.status(500).json({ error: err.message }));
});

app.get('/api/documents/:id', (req, res) => {
  const id = req.params.id;
  Document.findById(id)
    .then(doc => res.json(doc))
    .catch(err => res.status(500).json({ error: err.message }));
})

app.get('/api/documentsNameImg', (req, res) => {
  Document.find()
    .select('name img')
    .then(doc => res.json(doc))
    .catch(err => res.status(500).json({ error: err.message }));
});


//POST
app.post('/api/blogs/create', (req, res) => {
  const blog = new Blog(req.body);
  blog.save()
    .then((result) => {
      res.status(201).json(result)
    })
    .catch((err) => {
      res.status(500).json({error : err.message })
    });
})

app.post('/api/documents/create', upload.single('img'), (req, res) => {
  const imagePath =  `/images/${req.file.filename}`;
  const document = new Document({
    ...req.body,
    img: imagePath
  });

  document.save()
    .then(result => res.status(201).json(result))
    .catch(err => res.status(500).json({error: err.message}));
})

