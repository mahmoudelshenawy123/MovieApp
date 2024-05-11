// app.js

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const compression = require('compression');
const DBConfig = require('./src/config/DBConfig');
const { logger } = require('./src/config/logger');
const errorHandlers = require('./src/helper/ErrorHandler');
const moviesRouter = require('./src/components/Movies/MoviesRoutes');

const app = express();

// Connect to the database
DBConfig();

// Middlewares
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.options('*', cors());

// Routes
app.use('/movies', moviesRouter); // Use the movies router for '/movies' routes

// Error Handlers
app.use(errorHandlers.mongooseErrorHandler); // Mongoose validation errors
if (process.env.ENV === 'DEVELOPMENT') {
  app.use(errorHandlers.developmentErrorHandler); // Development error handler
} else {
  app.use(errorHandlers.productionErrorHandler); // Production error handler
}
app.use(errorHandlers.notFoundErrorHandler); // Not found error handler

// Global Error Handler
app.use(errorHandlers.globalErrorHandler); // Use the global error handler middleware

// Start the server
const PORT = process.env.PORT || 8080; // Default port is 8080 if not specified in .env
app.listen(PORT, () => {
  logger.info(`Server running at http://localhost:${PORT}`);
});
