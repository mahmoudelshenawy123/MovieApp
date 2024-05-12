const { default: mongoose } = require('mongoose');

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

module.exports = {
  ResponseSchema,
  PaginateSchema,
  CheckValidIdObject,
};
