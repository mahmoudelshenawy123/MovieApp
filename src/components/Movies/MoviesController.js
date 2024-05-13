const { logger } = require('../../config/logger');
const { errorHandler } = require('../../helper/ErrorHandler');
const {
  ResponseSchema,
  PaginateSchema,
  CheckValidIdObject,
} = require('../../helper/HelperFunctions');
const {
  AddMoviesFromFile,
  SetMoviesSearchedQueryObject,
} = require('./MoviesService');
const {
  SetAddedMovieData,
  AddMovie,
  GetAllMovies,
  GetAllMoviesCount,
  GetAllMoviesPaginated,
  GetMovieById,
  DeleteMovie,
  CheckMovieExist,
  UpdateMovie,
} = require('./MoviesService');

exports.addMoviesFromFile = async (req, res) => {
  try {
    const { newAddedFieldsKeys } = req.body;
    const { file } = req;

    logger.info('--------- Start Add Movies From File -----------');
    await AddMoviesFromFile(file, newAddedFieldsKeys);
    logger.info('--------- End Add Movies From File Successfully -----------');

    return res
      .status(201)
      .json(ResponseSchema('Movies Added Successfully', true));
  } catch (err) {
    console.log(err);
    logger.error(
      `---------- Error On Add Movies From CSV File Due To: ${err} -------------`,
    );
    return res
      .status(400)
      .json(
        ResponseSchema(
          `Somethings Went wrong Due To :${err.message}`,
          false,
          errorHandler(err),
        ),
      );
  }
};

exports.addMovie = async (req, res) => {
  const {
    Title,
    Director,
    Year,
    Country,
    Length,
    Genre,
    Colour,
    newAddedFieldsKeys,
  } = req.body;
  try {
    logger.info('--------- Start Add Movie -----------');
    const addedMovieData = SetAddedMovieData({
      Title,
      Director,
      Year,
      Country,
      Length,
      Genre,
      Colour,
      newAddedFieldsKeys,
    });

    const addedMovie = await AddMovie(addedMovieData);
    logger.info('--------- End Add Movie Successfully -----------');

    return res
      .status(201)
      .json(ResponseSchema('Movie Added Successfully', true, addedMovie));
  } catch (err) {
    console.log(err);
    logger.error(`---------- Error On Add Movie Due To: ${err} -------------`);
    return res
      .status(400)
      .json(
        ResponseSchema(
          `Somethings Went wrong Due To :${err.message}`,
          false,
          errorHandler(err),
        ),
      );
  }
};

exports.updateMovie = async (req, res) => {
  const {
    Title,
    Director,
    Year,
    Country,
    Length,
    Genre,
    Colour,
    newAddedFieldsKeys,
  } = req.body;
  const { id } = req.params;
  try {
    logger.info('--------- Start Update Movie -----------');
    if (!CheckValidIdObject(req, res, id, 'Movie Id is Invalid')) return;
    const movie = await CheckMovieExist(id);
    if (!movie.status) {
      res.status(404).json(ResponseSchema(movie.message, false));
      return;
    }
    const movieData = {
      Title,
      Director,
      Year,
      Country,
      Length,
      Genre,
      Colour,
      newAddedFieldsKeys,
    };
    const updatedMovieData = SetAddedMovieData(movieData, newAddedFieldsKeys);

    const updatedMovie = await UpdateMovie(id, updatedMovieData);
    logger.info('--------- End Update Movie Successfully -----------');

    res
      .status(201)
      .json(ResponseSchema('Movie Updated Successfully', true, updatedMovie));
    return;
  } catch (err) {
    console.log(err);
    logger.error(`---------- Error On Update Movie To: ${err} -------------`);
    res
      .status(400)
      .json(
        ResponseSchema(
          `Somethings Went wrong Due To :${err.message}`,
          false,
          errorHandler(err),
        ),
      );
  }
};

exports.getMovieById = async (req, res) => {
  try {
    const { id } = req.params;
    logger.info(`------------------ Movie with ID ${id} -----------------`);

    if (!CheckValidIdObject(req, res, id, 'Movie Id is Invalid')) return;
    const movie = await CheckMovieExist(id);
    if (!movie.status) {
      res.status(404).json(ResponseSchema(movie.message, false));
      return;
    }
    return res.status(200).json(ResponseSchema('Movie', true, movie?.data));
  } catch (err) {
    console.log(err);
    logger.error(
      `---------- Error On Getting Movie By ID ${err} -------------`,
    );
    return res
      .status(400)
      .json(
        ResponseSchema(
          `Something went wrong: ${err.message}`,
          false,
          errorHandler(err),
        ),
      );
  }
};

exports.getAllMovies = async (req, res) => {
  try {
    const searchedQuery = SetMoviesSearchedQueryObject(req?.query);

    logger.info('------------------ All Movies -----------------');
    const movies = await GetAllMovies(searchedQuery);

    return res.status(200).json(ResponseSchema('Movies', true, movies));
  } catch (err) {
    console.log(err);
    logger.error(
      `---------- Error On Getting All Movies Due To: ${err} -------------`,
    );
    return res
      .status(400)
      .json(
        ResponseSchema(
          `Somethings Went wrong Due To :${err.message}`,
          false,
          errorHandler(err),
        ),
      );
  }
};

exports.getAllMoviesWithPagination = async (req, res) => {
  try {
    const page = req.query.page - 1 || 0;
    const itemPerPage = req.query.limit || 10;
    const searchedQuery = SetMoviesSearchedQueryObject(req?.query);
    const count = await GetAllMoviesCount(searchedQuery);
    const pages = Math.ceil(count / itemPerPage);

    logger.info(
      '------------------ All Movies With Pagination -----------------',
    );
    const movies = await GetAllMoviesPaginated(
      Number(page),
      Number(itemPerPage),
      searchedQuery,
    );

    return res
      .status(200)
      .json(
        ResponseSchema(
          'Movies',
          true,
          PaginateSchema(page + 1, pages, count, movies),
        ),
      );
  } catch (err) {
    console.log(err);
    logger.error(
      `---------- Error On Getting All Movies With Pagination Due To: ${err} -------------`,
    );
    return res
      .status(400)
      .json(
        ResponseSchema(
          `Somethings Went wrong Due To :${err.message}`,
          false,
          errorHandler(err),
        ),
      );
  }
};

exports.deleteMovie = async (req, res) => {
  try {
    const { id } = req.params;

    logger.info('------------------ Start Movie Deleteing -----------------');
    if (!CheckValidIdObject(req, res, id, 'Movie Id is Invalid')) return;
    const movie = await GetMovieById(id);
    if (!movie) {
      logger.error('---------- Movie Id is wrong -------------');
      res.status(400).json(ResponseSchema('Movie Id is wrong', false));
      return;
    }
    await DeleteMovie(id);
    logger.info(
      '------------------ Movie Deleted Successfully -----------------',
    );
    res.status(201).json(ResponseSchema('Movie Deleted Successfully', true));
    return;
  } catch (err) {
    console.log(err);
    logger.error(
      `---------- Error On Deleteing Movie Due To: ${err} -------------`,
    );
    res
      .status(400)
      .json(
        ResponseSchema(
          `Somethings Went wrong Due To :${err.message}`,
          false,
          errorHandler(err),
        ),
      );
  }
};
