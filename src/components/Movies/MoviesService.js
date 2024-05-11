const XLSX = require('xlsx');
const { logger } = require('../../config/logger');
const { ResponseSchema } = require('../../helper/HelperFunctions');
const { Movies } = require('./MoviessModel');

exports.GetMoviesFromCSVFile = async (file) => {
  try {
    logger.info('--------- Start Get Movies From CSV File -----------');
    if (!file) {
      logger.error('--------- File Is Required -----------');
      return ResponseSchema('File is required.', false);
    }

    const extension = file.originalname.split('.').pop().toLowerCase();
    const allowed = ['xls', 'xlsx', 'csv'];

    if (allowed.indexOf(extension) === -1) {
      logger.error(
        '--------- File type is not supported. file type must be .xlsx or .xls or .csv -----------',
      );
      return ResponseSchema(
        'File type is not supported. file type must be .xlsx or .xls or .csv',
        false,
      );
    }

    const data = await file.buffer;
    const workbook = XLSX.read(data);
    const workSheet = workbook.Sheets[workbook.SheetNames[0]];
    let moviesData = XLSX.utils.sheet_to_json(workSheet);
    moviesData = moviesData.filter((question) => question);
    logger.info(
      '--------- Finish Get Movies From CSV File Successfully -----------',
    );
    return ResponseSchema('Added Data', true, moviesData);
  } catch (err) {
    logger.error(
      `--------- Error While Getting Movies From CSV File ${err?.message} -----------`,
    );
    throw ResponseSchema(err?.message, true, err);
  }
};

exports.SetAddedMovieData = (movie, newAddedFieldsKeys = []) => {
  try {
    logger.info('--------- Start Setting Added Movie Data -----------');

    const additionalInfo = newAddedFieldsKeys
      ?.map((newKey) => {
        if (movie?.[newKey]) {
          return {
            info_value: newKey,
            info_type: movie?.[newKey],
          };
        }
        return null;
      })
      ?.filter((info) => info);

    logger.info(
      '--------- Finish Setting Added Movie Data Successfully -----------',
    );
    return {
      title: movie?.Title,
      director: movie?.Director,
      year: movie?.Year,
      country: movie?.Country,
      length: movie?.Length,
      genre: movie?.Genre,
      colour: movie?.Colour,
      additional_info: additionalInfo,
    };
  } catch (err) {
    logger.error(`--------- Error While Setting Movie Data ${err} -----------`);
    throw err;
  }
};

exports.AddMoviesFromFile = async (file, newAddedFieldsKeys = []) => {
  try {
    const moviesData = await this.GetMoviesFromCSVFile(file);
    if (!moviesData?.status) {
      logger.info(
        `--------- Error While Getting Movies From CSV Due To ${moviesData?.message} -----------`,
      );
      return moviesData;
    }

    const addedMoviesData = moviesData?.data?.map((movie) =>
      this.SetAddedMovieData(movie, newAddedFieldsKeys),
    );

    const addedMovies = await this.AddMovies(addedMoviesData);
    return ResponseSchema('Add Movies Successfully', true, addedMovies);
  } catch (err) {
    logger.error(`--------- Error While Setting Movie Data ${err} -----------`);
    throw err;
  }
};

exports.AddMovies = async (data) => {
  try {
    logger.info('--------- Start Add Movies -----------');
    const addedMovies = await Movies.create(data);
    logger.info('--------- Finish Add Movies Successfully -----------');
    return addedMovies;
  } catch (err) {
    logger.error(
      `--------- Error While Adding Movies Due To ${err} -----------`,
    );
    throw err;
  }
};

exports.AddMovie = async (data) => {
  try {
    logger.info('--------- Start Add Movie -----------');
    const addedMovie = await Movies.create(data);
    logger.info('--------- Finish Add Movie Successfully -----------');
    return addedMovie;
  } catch (err) {
    logger.error(
      `--------- Error While Adding Movie Due To ${err} -----------`,
    );
    throw err;
  }
};

exports.GetAllMovies = async () => {
  try {
    logger.info('--------- Get All Movies -----------');
    const movies = await Movies.find({});
    logger.info('--------- Get All Movies Successfully -----------');
    return movies;
  } catch (err) {
    logger.error(
      `--------- Error While Getting All Movies Due To ${err} -----------`,
    );
    throw err;
  }
};

exports.GetAllMoviesPaginated = async (query = {}) => {
  try {
    const { page, itemPerPage } = query;
    logger.info('--------- Get All Movies With Pagination -----------');
    const movies = await Movies.find({})
      .sort({ _id: -1 })
      .skip(page * itemPerPage)
      .limit(itemPerPage);
    logger.info(
      '--------- Get All Movies With Pagination Successfully -----------',
    );
    return movies;
  } catch (err) {
    logger.error(
      `--------- Error While Getting All Movies With Pagination Due To ${err} -----------`,
    );
    throw err;
  }
};

exports.GetAllMoviesCount = async () => {
  try {
    logger.info('--------- Get All Movies Count -----------');
    const moviesCount = await Movies.find({}).count();
    logger.info('--------- Get All Movies Count Successfully -----------');
    return moviesCount;
  } catch (err) {
    logger.error(
      `--------- Error While Getting All Movies Count Due To ${err} -----------`,
    );
    throw err;
  }
};

exports.GetMovieById = async (id) => {
  try {
    logger.info('--------- Get Movie By Id -----------');
    const movie = await Movies.findById(id);
    logger.info('--------- Get Movie By Id Successfully -----------');
    return movie;
  } catch (err) {
    logger.error(
      `--------- Error While Getting Movie By Id Due To ${err} -----------`,
    );
    throw err;
  }
};

exports.CheckMovieExist = async (id) => {
  try {
    const movie = await this.GetMovieById(id);
    if (!movie) {
      logger.error('---------- Movie Id is wrong -------------');
      return ResponseSchema('Movie Id is wrong', false);
    }
    return ResponseSchema('Movie', true, movie);
  } catch (err) {
    logger.error(
      `--------- Error While Checking Movie By Id Due To ${err} -----------`,
    );
    throw err;
  }
};

exports.DeleteMovie = async (id) => {
  try {
    logger.info('--------- Delete Movie By Id -----------');
    const movie = await Movies.findByIdAndDelete(id);
    logger.info('--------- Delete Movie By Id Successfully -----------');
    return movie;
  } catch (err) {
    logger.error(
      `--------- Error While Deleteing Movie By Id Due To ${err} -----------`,
    );
    throw err;
  }
};

exports.UpdateMovie = async (id, data) => {
  try {
    logger.info('--------- Update Movie By Id -----------');
    const movie = await Movies.findByIdAndUpdate(id, data);
    logger.info('--------- Update Movie By Id Successfully -----------');
    return movie;
  } catch (err) {
    logger.error(
      `--------- Error While Updating Movie By Id Due To ${err} -----------`,
    );
    throw err;
  }
};
