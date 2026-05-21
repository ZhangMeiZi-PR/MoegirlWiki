const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const { describe } = require('node:test');

const app = express();

// middleware
app.use(cors()); // React connect
app.use(express.json()); 
app.use(morgan('dev'));

//connect to MongoDB
const dbURL = 'mongodb://JensenZ:20051118Zpr@ac-rsdbp93-shard-00-00.pbhj9aw.mongodb.net:27017,ac-rsdbp93-shard-00-01.pbhj9aw.mongodb.net:27017,ac-rsdbp93-shard-00-02.pbhj9aw.mongodb.net:27017/Test-01?ssl=true&replicaSet=atlas-123bre-shard-0&authSource=admin&appName=Test';

mongoose.connect(dbURL)
.then(() => {
  app.listen(5000)
})
.catch( err => console.log(err));

// Schema and Model create
const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  details: {
    author: {
      type: String,
      required: true
    },
    time: {
      type: String,
      required: true
    },
    avatar: {
      type: String,
      required: true
    }
  }
});

const Blog = mongoose.model('Blog', blogSchema);

// API ROUTE
app.get('/api/blogs', (req, res) => {
  Blog.find()
  .then(blogs => res.json(blogs))
  .catch(err => res.status(500).json({ error: err.message }));
});

