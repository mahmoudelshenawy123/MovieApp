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

module.exports = {
  ResponseSchema,
  PaginateSchema,
};
