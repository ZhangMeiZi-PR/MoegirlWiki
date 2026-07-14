const { getContainer } = require('../config/db');
const { containerClient } = require('../config/upload');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');

const handleDocAll = async (req, res) => {
  const container = getContainer();
  const querySpec = {
    query: "SELECT * FROM c WHERE c.type = 'document' ORDER BY c.createdAt DESC"
  };
  try {
    const { resources: documents } = await container.items.query(querySpec).fetchAll();
    res.json(documents);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
};

const handleDocId = async (req, res) => {
  const id = req.params.id;
  const container = getContainer();
  const querySpec = {
    query: "SELECT * FROM c WHERE c.type = 'document' AND c.id = @docId",
    parameters: [{ name: "@docId", value: id }]
  }
  try {
    const { resources: documents } = await container.items.query(querySpec).fetchAll();
    const document = documents[0];
    if (!document || document.type !== 'document') {
      return res.status(404).json({ error: 'Document not found' })
    }
    res.json(document);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
};

const handleDocPost = async (req, res) => {
  const container = getContainer();
  const FileName = `blogImage--${Date.now()}--${crypto.randomUUID()}`;
  const blockBlobClient = containerClient.getBlockBlobClient(FileName);
  const { name, date, description, baiduLink, userId, author } = req.body;
  try {
    await blockBlobClient.uploadData(req.file.buffer, {
      tags: { status: 'ducument' }
    });
    const newDoc = {
      id: uuidv4(),
      userId,
      author,
      type: 'document',
      docName: name,
      eventDate: date,
      exampleImage: blockBlobClient.url,
      description,
      link: baiduLink,
      createdAt: new Date().toISOString()
    };
    const { resources: savedDoc } = await container.items.create(newDoc);
    return res.status(201).json(savedDoc);
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ errpr: err.message });
  }
};

const handleDocDelete = async (req, res) => {
  const container = getContainer();
  const { id, userId } = req.params;

  try {
    await container.item(id, userId).delete();
    res.json({ message: "Document deleted" })
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
};

const handleDocUpdate = async (req, res) => {
  const container = getContainer();
  const { id, userId } = req.params;
  const FileName = `documentImage--${Date.now()}--${crypto.randomUUID()}`;
  const blockBlobClient = containerClient.getBlockBlobClient(FileName);
  const { name, author, date, baiduLink } = req.body;
  try {
    const { resource: existingDoc } = await container.item(id, userId).read();
    if (!existingBlog || existingBlog.type !== 'document') {
      return res.status(404).json({ error: "Blog not found" });
    }
    await blockBlobClient.uploadData(req.file.buffer, {
      tags: { status: 'ducument' }
    });
    const updatedDoc = {
      ...existingDoc,
      userId,
      author,
      docName: name,
      eventDate: date,
      exampleImage: blockBlobClient.url,
      description,
      link: baiduLink,
      updatedAt: new Date().toISOString()
    };
    const { resource: savedItem } = await container.item(id, id).replace(updatedDoc);
    res.json(savedItem);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
}

module.exports = { handleDocAll, handleDocId, handleDocPost, handleDocDelete };



