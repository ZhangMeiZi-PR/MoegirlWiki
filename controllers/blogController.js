const Blog = require('../models/blogModel');

const handleBlogAll = (req, res) => {
  Blog.find()
    .sort({ createdAt: -1 })
    .then(blogs => res.json(blogs))
    .catch(err => res.status(500).json({ error: err.message }));
};

const handleBlogRecent = (req, res) => {
  Blog.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .then(blogs => res.json(blogs))
    .catch(err => res.status(500).json({ error: err.message }));
};

const handleBlogId = (req, res) => {
  const id = req.params.id;
  Blog.findById(id)
    .then(blog => res.json(blog))
    .catch(err => res.status(500).json({ error: err.message }));
};

const handleBlogPost = (req, res) => {
  const blog = new Blog(req.body);
  blog.save()
    .then((result) => {
      res.status(201).json(result)
    })
    .catch((err) => {
      res.status(500).json({ error: err.message })
    });
    
}

module.exports = { handleBlogAll, handleBlogRecent, handleBlogId, handleBlogPost };