const jwt = require('jsonwebtoken');
const { getContainer } = require('../config/db');

const handleLogout = async (req, res) => {
  // On client, also delete the accessToken
  const cookies = req.cookies;
  const container = getContainer();
  try {
    if (!cookies?.jwt) {
      return res.sendStatus(204); // No content
    }
    const refreshToken = cookies.jwt;
    const querySpec = {
      query: "SELECT * FROM c WHERE c.type = 'user' AND c.email = @refreshToken",
      parameters: [{ name: "@refreshToken", value: refreshToken }]
    }
    // Is refreshToken in DB?
    const { resources: users } = await container.items.query(querySpec).fetchAll();
    const user = users[0];
    if (!user) {
      res.clearCookie('jwt', { httpOnly: true, maxAge: 30 * 24 * 60 * 60 * 1000, sameSite: 'None', secure: true });
      return res.sendStatus(204);
    }

    // Delete refreshToken in DB
    await container.item(user.id, user.id).patch({
      operations: [
        {
          op: "set",
          path: "/refreshToken",
          value: ''
        }
      ]
    });
    res.clearCookie('jwt', { httpOnly: true, maxAge: 30 * 24 * 60 * 60 * 1000, sameSite: 'None', secure: true });
    res.sendStatus(204);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { handleLogout };