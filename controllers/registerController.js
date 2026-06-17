const { getContainer } = require('../config/db');

const handleRegister = async (req, res) => {
  const imagePath = `/images/${req.file.filename}`;
  const { username, email, password } = req.body;

  try {
    if (!username || !email || !password || !imagePath) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }
    const newUser = await User.create({
      ...req.body,
      avatar: imagePath,
    });
    const savedUser = await newUser.save();
    res.status(201).json({ message: 'User registered successfully', user: newUser })
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message});
  }
};

module.exports = { handleRegister };