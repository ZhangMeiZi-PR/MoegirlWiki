const jwt = require('jsonwebtoken');
const { getContainer } = require('../config/db.js')

const handleRefreshToken = async (req, res) => {
  const cookies = req.cookies;
  const container = getContainer();
  try {
    if (!cookies?.jwt) {
      return res.sendStatus(401);
    }
    console.log(cookies.jwt);
    const refreshToken = cookies.jwt;
    const querySpec = {
      query: "SELECT * FROM c WHERE c.type = 'user' AND c.refreshToken = @refreshToken",
      parameters: [{ name: "@refreshToken", value: refreshToken }]
    }
    const { resources: users } = await container.items.query(querySpec).fetchAll();
    const foundUser = users[0];
    if (!foundUser) return res.sendStatus(403); // Forbidden
    // evaluate JWT
    jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET,
      (err, decoded) => {
        if (err || foundUser.username !== decoded.username) return res.sendStatus(403);
        // generate access JWT
        const roles = Object.values(foundUser.roles);
        const user = {
          id: foundUser.id,
          username: foundUser.username,
          email: foundUser.email,
          avatar: foundUser.avatar
        };
        const accessToken = jwt.sign(
          {
            "username": decoded.username,
            "roles": roles,
          },
          process.env.ACCESS_TOKEN_SECRET,
          { expiresIn: '15m' }
        );
        res.json({ user, roles, accessToken });
      }
    )

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { handleRefreshToken };