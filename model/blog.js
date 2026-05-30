const mongoose = require('mongoose')



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
    avatar: {
      type: String,
      required: true
    }
  }
}, { timestamps: true });

const Blog = mongoose.model('Blog', blogSchema);

module.exports = Blog;