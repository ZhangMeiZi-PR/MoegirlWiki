const { getContainer } = require('../config/db')

const handleUserGet = async (req, res) => {
  const { id } = req.params;
  const container = getContainer();
  const querySpec = {
    query: "SELECT * FROM c WHERE c.type = 'user' AND c.id = @id",
    parameters: [{ name: "@id", value: id }]
  }
  try {
    const { resources: users } = await container.items.query(querySpec).fetchAll();
    const user = users[0];
    if (!user) {
      return res.status(500).json("Can't find user");
    }
    res.status(200).json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).json(err.message);
  }
};

module.exports = { handleUserGet }