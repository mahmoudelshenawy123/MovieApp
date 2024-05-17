const { default: mongoose } = require('mongoose');
const { logger } = require('@src/config/Logger');

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
  ConvertToObjectId,
  CheckValidIdObject,
  LogInfo,
  LogError,
  LogWarn,
};
