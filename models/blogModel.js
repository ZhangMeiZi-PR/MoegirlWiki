const mongoose = require('mongoose')



// Schema and Model create
const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  description: {
    type: String,
  },
  details: {
    author: {
      type: String,
    },
    avatar: {
      type: String,
    }
  }
}, { timestamps: true });

const Blog = mongoose.model('Blog', blogSchema);

module.exports = Blog;