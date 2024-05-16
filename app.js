// app.js
require('./src/config/ModuleAliases');
require('dotenv').config({ path: `.env.${process.env.NODE_ENV}` });

const express = require('express');
const cors = require('cors');
const compression = require('compression');
const morgan = require('morgan');

const DBConfig = require('@src/config/DBConfig');
const errorHandlers = require('@src/helper/ErrorHandler');
const routes = require('@src/config/Routes');
const authJwt = require('@src/middleware/auth');
const { LogInfo } = require('@src/helper/HelperFunctions');

const app = express();
// Connect to the database
DBConfig();

// Middlewares
app.use(compression());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.options('*', cors());
app.use(authJwt());

// Routes
app.use('/', routes);

// Error Handlers
app.use(errorHandlers.mongooseErrorHandler);
app.use(errorHandlers.authorizationErrorHandler);
if (process.env.ENV === 'DEVELOPMENT') {
  app.use(errorHandlers.developmentErrorHandler);
} else {
  app.use(errorHandlers.productionErrorHandler);
}
app.use(errorHandlers.notFoundErrorHandler);

// Global Error Handler
app.use(errorHandlers.globalErrorHandler);

// Start the server
const PORT = process.env.PORT || 8080;
const server = app.listen(PORT, () => {
  LogInfo(`Server running at http://localhost:${PORT}`);
});

module.exports = {
  server,
  app,
};
