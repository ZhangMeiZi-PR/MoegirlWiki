const User = require('../models/userModel');

const handleUserGet = (req, res) => {
  const userId = req.params.id;
  User.findById(userId)
    .select('username avatar email roles')
    .then(user => res.json(user))
    .catch(err => res.status(500).json({error: err.message}))
}

module.exports = { handleUserGet }