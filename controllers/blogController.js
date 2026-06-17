const { getContainer } = require('../config/db');

const handleBlogAll = async (req, res) => {
  const container = getContainer();
  const querySpec = {
    query: "SELECT * FROM c WHERE c.type = 'blog' ORDER BY c.createdAt DESC"
  };
  try {
    const { resources: blogs } = await container.items.query(querySpec).fetchAll();
    res.json(blogs);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
};

const handleBlogRecent = (req, res) => {
  const container = getContainer();
  const querySpec = {
    query: "SELECT TOP 5 * FROM c WHERE c.type = 'blog' ORDER BY c.createdAt DESC "
  };

  try {
    const { resources: blogs } = await container.items.query(querySpec).fetchAll();
    res.json(blogs);
  } catch {
    console.error(err.message);
    res.status(500).json({ error: err.message })
  }
};

const handleBlogId = (req, res) => {
  const id = req.params.id;
  const container = getContainer();
  try {
    const { resource: blog } = await container.item(id, id).read();
    if (!blog || blog.type !== 'blog') {
      return res.status(404).json({ error: 'Blog not found' })
    }
    res.json(blog);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
};

const handleBlogPost = (req, res) => {
  const container = getContainer();

  try {
    const blogId = `blog_${Date.now()}`;

    const newBlog = {
      id: blogId,
      blogId,
      type: 'blog',
      title: req.body.title,
      content: req.body.content,
      description: req.body.description,
      authorId: req.userId || req.body.userId,
      createdAt: new Date().toISOString(),
    };
    const { resource: createdItem } = await container.items.create(newBlog);
    res.status(201).json(createdItem);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
};

const handleBlogDelete = async (req, res) => {
  const container = getContainer();
  const id = req.params.id;

  try {
    await container.item(id, id).delete();
    res.json({ message: "Blog deleted" })
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
};

const handleBlogUpdate = async (req, res) => {
  const container = getContainer();
  const id = req.params.id;

  try {
    const { resource: existingBlog } = await container.item(id, id).read();
    if (!existingBlog || existingBlog.type !== 'blog') {
      return res.status(404).json({ error: "Blog not found" });
    }

    const updatedBlog = {
      ...existingBlog,
      title: req.body.title || existingBlog.title,
      content: req.body.content || existingBlog.content,
      description: req.body.description || existingBlog.description,
      updatedAt: new Date().toISOString()
    }

    const { resource: savedItem } = await container.item(id, id).replace(updatedBlog);
    res.json(savedItem);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
}



module.exports = { handleBlogAll, handleBlogRecent, handleBlogId, handleBlogPost, handleBlogDelete, handleBlogUpdate };