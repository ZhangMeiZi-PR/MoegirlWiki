const { CosmosClient } = require('@azure/cosmos');

const endpoint = process.env.COSMOS_ENDPOINT;
const key = process.env.COSMOS_KEY;
const databaseId = process.env.COSMOS_DATABASE;
const containerId = process.env.COSMOS_CONTAINER;

const client = new CosmosClient({ endpoint, key })

async function connectDB() {
  try {
    const dbResponse = await client.databases.createIfNotExists({ id: databaseId });
    database = dbResponse.database
    const containerResponse = await database.containers.createIfNotExists({ id: containerId });
    container = containerResponse.container;

    console.log("connected to Azure CosmosDB");
  } catch (err) {
    console.error("Failed to connect: ", err.message);
    process.exit(1);
  }
}

module.exports = { connectDB, getContainer: () => container };