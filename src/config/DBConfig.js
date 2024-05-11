const mongoose = require('mongoose');
const { logger } = require('./logger');

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
      logger.info('Connected to MongoDB...');
      return db;
    })
    .catch((err) => {
      logger.error(
        `Could not connect to MongoDB, exiting the application Due to: ${err}`,
      );
      process.exit();
    });

module.exports = DBConfig;
