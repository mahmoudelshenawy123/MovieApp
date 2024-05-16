const mongoose = require('mongoose');
const { LogInfo, LogError } = require('@src/helper/HelperFunctions');

const DBConfig = () =>
  mongoose
    .connect(process.env.CONNECTION_STRING, {
      dbName: process.env.DB_NAME,
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
    })
    .then((db) => {
      LogInfo('Connected to MongoDB...');
      return db;
    })
    .catch((err) => {
      LogError(
        `Could not connect to MongoDB, exiting the application Due to: ${err}`,
      );
      process.exit();
    });

module.exports = DBConfig;
