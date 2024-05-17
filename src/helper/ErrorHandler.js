const { LogError } = require('@src/helper/HelperFunctions');

const ErrorHandler = (error) => {
  let errorMessage = '';
  if (error.name === 'ValidationError') {
    const validationErrors = Object.values(error.errors).map(
      (err) => err.message,
    );
    errorMessage = validationErrors.join(', ');
  } else {
    errorMessage = error.message || 'Internal server error';
  }
  LogError(errorMessage);
  return { error: errorMessage };
};

const MongooseErrorHandler = (err, req, res, next) => {
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((error) => error.message);
    const message = `Validation Error: ${errors.join(', ')}`;
    LogError(message);
    return res.status(400).json({ error: message });
  }
  next(err);
};

const AuthorizationErrorHandler = (err, req, res, next) => {
  if (err.name === 'UnauthorizedError') {
    LogError(err.message);
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next(err);
};

const DevelopmentErrorHandler = (err, req, res) => {
  LogError(err.stack);
  res.status(err.status || 500).json({ error: err.message });
};

const ProductionErrorHandler = (err, req, res) => {
  LogError(err.message);
  res.status(err.status || 500).json({ error: 'Internal Server Error' });
};

const NotFoundErrorHandler = (req, res, next) => {
  const message = `Not Found - ${req.originalUrl}`;
  LogError(message);
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

const GlobalErrorHandler = (err, req, res) => {
  LogError(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
};

module.exports = {
  ErrorHandler,
  MongooseErrorHandler,
  DevelopmentErrorHandler,
  ProductionErrorHandler,
  NotFoundErrorHandler,
  AuthorizationErrorHandler,
  GlobalErrorHandler,
};
