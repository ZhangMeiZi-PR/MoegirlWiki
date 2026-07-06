const { getContainer } = require('../config/db');
const { containerClient } = require('../config/upload');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');

// GET
const handleBlogAll = async (req, res) => {
  const container = getContainer();
  const limit = parseInt(req.query.limit) || 10;
  const offset = parseInt(req.query.offset) || 0;
  const needCount = req.query.needCount === 'true';

  const pinnedQuerySpec = {
    query: "SELECT * FROM c WHERE c.type = 'blog' AND c.isPinned = true ORDER BY c.createdAt DESC"
  };
  const dailyQuerySpec = {
    query: "SELECT * FROM c WHERE c.type = 'blog' AND c.isPinned != true ORDER BY c.createdAt DESC OFFSET @offset LIMIT @limit",
    parameters: [
      { name: "@offset", value: offset },
      { name: "@limit", value: limit }
    ]
  };

  try {

    const promises = [
      container.items.query(pinnedQuerySpec).fetchAll(),
      container.items.query(dailyQuerySpec).fetchAll(),
    ];
    if (needCount) {
      const countQuerySpec = {
        query: "SELECT VALUE COUNT(1) FROM c WHERE c.type = 'blog' AND c.isPinned != true"
      };
      promises.push(container.items.query(countQuerySpec).fetchAll());
    }

    const results = await Promise.all(promises);


    const responseData = {
      isPinned: results[0].resources,
      daily: results[1].resources,
    };

    if (needCount && results[2]) {
      responseData.totalCount = results[2].resources[0];
    }
    return res.status(200).json(responseData);

  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ error: err.message });
  }
};

const handleBlogRecent = async (req, res) => {
  const container = getContainer();
  const querySpec = {
    query: "SELECT TOP 5 * FROM c WHERE c.type = 'blog' ORDER BY c.createdAt DESC "
  };

  try {
    const { resources: blogs } = await container.items.query(querySpec).fetchAll();
    return res.json(blogs);
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ error: err.message })
  }
};

const handleBlogId = async (req, res) => {
  const { id } = req.params;
  const container = getContainer();
  const querySpec = {
    query: "SELECT * FROM c WHERE c.type = 'blog' AND c.id = @id ORDER BY c.createdAt DESC ",
    parameters: [{ name: "@id", value: id }]
  };
  try {
    const { resources: blogs } = await container.items.query(querySpec).fetchAll();
    const blog = blogs[0];
    if (!blog || blog.type !== 'blog') {
      return res.status(404).json({ error: 'Blog not found' })
    }
    return res.json(blog);
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ error: err.message });
  }
};

const handleBlogUserId = async (req, res) => {
  const { userId } = req.params;
  const container = getContainer();
  const querySpec = {
    query: "SELECT * FROM c WHERE c.type = 'blog' AND c.userId = @userId ORDER BY c.createdAt DESC",
    parameters: [{ name: "@userId", value: userId }]
  };
  try {
    const { resources: blogs } = await container.items.query(querySpec).fetchAll();
    return res.status(200).json(blogs);
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ error: err.message });
  }
};

// POST
const handleBlogImageUpload = async (req, res) => {
  const FileName = `blogImage--${Date.now()}--${crypto.randomUUID}`;
  const blockBlobClient = containerClient.getBlockBlobClient(FileName);
  await blockBlobClient.uploadData(req.file.buffer, {
    tags: { status: 'temporary' }
  });

  return res.json({ url: blockBlobClient.url })
};

const handleBlogPost = async (req, res) => {
  const container = getContainer();
  const { content, title, description, details } = req.body;
  if (!content || !title) {
    return res.status(400).json({ error: 'Title and content fields are required' });
  }
  try {
    const azureUrlRegex = /https:\/\/testfiledb\.blob\.core\.windows\.net\/image\/[^\s"'>]+/g;
    const foundUrls = content.match(azureUrlRegex) || [];
    // loop each image url
    for (const url of foundUrls) {
      try {
        const fileName = decodeURIComponent(url.substring(url.lastIndexOf('/') + 1));
        const blockBlobClient = containerClient.getBlobClient(fileName);
        await blockBlobClient.setTags({});
      } catch (err) {
        console.warn(err.message);
        return res.status(500).json({ error: err.message })
      }
    }
    // new blog
    const newBlog = {
      id: uuidv4(),
      type: 'blog',
      author: details?.author || null,
      userId: details?.userId,
      title,
      avatar: details?.avatar,
      description,
      content,
      images: foundUrls,
      isPinned: req.body.isPinned || false,
      createdAt: new Date().toISOString(),
      comments: []
    };
    const { resource: createdItem } = await container.items.create(newBlog);
    return res.status(201).json(createdItem);
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ error: err.message });
  }
};

// DELETE
const handleBlogDelete = async (req, res) => {
  const container = getContainer();
  const { id, userId } = req.params;

  try {
    await container.item(id, userId).delete();
    return res.json({ message: "Blog deleted" })
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ error: err.message });
  }
};

// PATCH/PUT
const handleBlogCommentsUpdate = async (req, res) => {
  const container = getContainer();
  const id = req.query.id;
  const userId = req.query.userId;
  const { body, author, avatar } = req.body;
  if (!body) {
    return res.status(400).json({ message: "Commnet body is required" });
  }

  const newComment = {
    id: uuidv4(),
    body,
    author,
    avatar,
    createdAt: new Date().toISOString()
  };

  try {
    const patchOperations = [
      {
        op: "add",
        path: "/comments/-",
        value: newComment
      }
    ]

    const { resource: updatedBlog } = await container.item(id, userId).patch(patchOperations);
    return res.status(200).json(updatedBlog);
  } catch (err) {
    console.error(err.message);
    if (err.code === 404) {
      return res.status(404).json({ message: "Blog not found" });
    }
    return res.status(500).json({ error: err.message });
  }
}

const handleBlogUpdate = async (req, res) => {
  const container = getContainer();
  const { id, userId } = req.params;

  try {
    const { resource: existingBlog } = await container.item(id, userId).read();
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

    const { resource: savedItem } = await container.item(id, userId).replace(updatedBlog);
    return res.json(savedItem);
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ error: err.message });
  }
}



module.exports = { handleBlogAll, handleBlogRecent, handleBlogId, handleBlogUserId, handleBlogPost, handleBlogDelete, handleBlogUpdate, handleBlogImageUpload, handleBlogCommentsUpdate };