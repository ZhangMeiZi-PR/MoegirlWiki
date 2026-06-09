const jwt = require('jsonwebtoken');
const User = require('../models/userModel.js');


const handleLogout = async (req, res) => {
  // On client, also delete the accessToken

  const cookies = req.cookies;
  try {
    if (!cookies?.jwt) {
      return res.sendStatus(204); // No content
    }
    const refreshToken = cookies.jwt;
    
    // Is refreshToken in DB?
    const user = await User.findOne({ refreshToken });
    if(!user) {
      res.clearCookie('jwt', { httpOnly: true, maxAge: 30 * 24 * 60 * 60 * 1000, sameSite: 'None', secure: true });
      return res.sendStatus(204); 
    }

    // Delete refreshToken in DB
    user.refreshToken= '';
    await user.save();
    res.clearCookie('jwt', {httpOnly: true, maxAge: 30 * 24 * 60 * 60 * 1000, sameSite: 'None', secure: true });
    res.sendStatus(204);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { handleLogout };