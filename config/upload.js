const { BlobServiceClient } = require('@azure/storage-blob');
require('dotenv').config();
// Env variables
const container = process.env.AZURE_STORAGE_CONTAINER;

// initialaize the service client
const blobServiceClient = BlobServiceClient.fromConnectionString(
  process.env.AZURE_STORAGE_CONNECTION_STRING
);

// container
const containerClient = blobServiceClient.getContainerClient(container);

module.exports = { containerClient } ;

