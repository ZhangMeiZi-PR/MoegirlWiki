const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const handleLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid Email or Password!' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid Email or Password' });
    }
    // create JTWs
    const accessToken = jwt.sign(
      { "username": user.username },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: '10s' }
    );
    const refreshToken = jwt.sign(
      { "username": user.username },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: '30d' }
    );

    // save refreshToken to mongoDB
    user.refreshToken = refreshToken;
    await user.save();

    // send cookie and JSON token
    const roles = Object.values(user.roles);
    res.cookie('jwt', refreshToken, {
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000,
      sameSite: 'None',
      secure: true
    });
    res.status(200).json({
      accessToken,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar
      },
      roles: roles
    });

  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = {handleLogin};