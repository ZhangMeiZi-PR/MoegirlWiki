const { getContainer } = require('../config/db');
const { containerClient } = require('../config/upload');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

const handleRegister = async (req, res) => {
  const container = getContainer();
  const { username, email, password } = req.body;

  if (!username || !email || !password || !req.file) {
      return res.status(400).json({ message: 'All fields are required' });
  }
  const emailLowerCase = email.toLowerCase();
  try {  
      const querySpec = {
        query: "SELECT * FROM c WHERE c.type = 'user' AND c.email = @email",
        parameters: [{ name: "@email", value: emailLowerCase }]
      };
      const { resources: existingUsers } = await container.items.query(querySpec).fetchAll();

      if (existingUsers.length > 0) {
        return res.status(400).json('User already exists');
      }

      // upload avatar
      const FileName = `avatarImage--${Date.now()}--${crypto.randomUUID}`
      const blockBlobClient = containerClient.getBlockBlobClient(FileName);
      await blockBlobClient.uploadData(req.file.buffer);

      // create User
      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = {
        id: uuidv4(),
        userId: uuidv4(),
        type: 'user',
        username,
        email: emailLowerCase,
        password: hashedPassword,
        avatar: blockBlobClient.url,
        roles: { Editor: 2006 },
        createdAt: new Date().toISOString()
      };
      const { resources: savedUser } = await container.items.create(newUser);
      
      res.status(201).json('User registered successfully');
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message});
  }
};

module.exports = { handleRegister };