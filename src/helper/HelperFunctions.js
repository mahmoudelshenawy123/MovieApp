const { default: mongoose } = require('mongoose');
const jwt = require('jsonwebtoken');
const { logger } = require('@src/config/logger');

const PaginateSchema = (currentPage, pages, count, data) => ({
  currentPage,
  pages,
  count,
  data,
});

const ResponseSchema = (message, status, data) => ({
  message,
  status,
  data,
});

const CheckValidIdObject = (req, res, id, message = '') => {
  if (!mongoose.isValidObjectId(id)) {
    res.status(400).json(ResponseSchema(message, false));
    return false;
  }
  return true;
};

const DecodeToken = (req, res, next) => {
  const token = req?.headers?.authorization?.split(' ')?.[1];
  const authedUser = jwt.decode(token);
  req.authedUser = authedUser;
  next();
};

const ConvertToObjectId = (value) => mongoose.Types.ObjectId(value);

const LogInfo = (message) =>
  logger.info(`------------ ${message} ------------`);

const LogError = (message) =>
  logger.error(`------------ ${message} ------------`);

const LogWarn = (message) =>
  logger.warn(`------------ ${message} ------------`);

module.exports = {
  ResponseSchema,
  PaginateSchema,
  DecodeToken,
  ConvertToObjectId,
  CheckValidIdObject,
  LogInfo,
  LogError,
  LogWarn,
};
