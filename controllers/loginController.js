const { getContainer } = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const handleLogin = async (req, res) => {
  const container = getContainer();
  const { email, password } = req.body;
  const emailLowerCase = email.toLowerCase();
  const querySpec = {
    query: "SELECT * FROM c WHERE c.type = 'user' AND c.email = @email",
    parameters: [{ name: "@email", value: emailLowerCase }]
  }
  try {
    const { resources: users } = await container.items.query(querySpec).fetchAll();
    const user = users[0];
    console.log(user);
    if (!user) {
      return res.status(400).json({ error: 'InvalidAll Email or Password!' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid Email or Password' });
    }
    // create JTWs
    const accessToken = jwt.sign(
      { "username": user.username },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: '15m' }
    );
    const refreshToken = jwt.sign(
      { "username": user.username },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: '30d' }
    );

    // save refreshToken to DB
    user.refreshToken = refreshToken;
    await container.item(user.id, user.userId).patch({
      operations: [
        {
          op: "set",
          path: "/refreshToken",
          value: refreshToken
        }
      ]
    });

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
        id: user.id,
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

module.exports = { handleLogin };