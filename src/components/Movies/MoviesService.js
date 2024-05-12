const XLSX = require('xlsx');
const { default: axios } = require('axios');
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
    moviesData = moviesData
      ?.map((movie) => {
        return {
          ...movie,
          Year: String(movie?.Year),
        };
      })
      .filter((movie) => movie);
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
            info_type: newKey,
            info_value: movie?.[newKey],
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
      additional_info: additionalInfo?.length
        ? additionalInfo
        : movie?.newAddedFieldsKeys,
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

    const syncedData = await this.SyncMoviesWithDB(addedMoviesData);

    return ResponseSchema('Add Movies Successfully', true, syncedData);
  } catch (err) {
    logger.error(`--------- Error While Setting Movie Data ${err} -----------`);
    throw err;
  }
};

exports.SyncMoviesWithDB = async (movies) => {
  try {
    const existingMovies = await Movies.find({});

    const moviesToUpdate = [];
    const moviesToAdd = [];

    movies.forEach((movie) => {
      const existingMovie = existingMovies.find(
        (m) => String(m.title) === String(movie.title),
      );
      if (existingMovie) {
        if (this.IsMovieNeedSync(movie, existingMovie))
          moviesToUpdate.push(movie);
      } else {
        moviesToAdd.push(movie);
      }
    });

    const updatedMovies = await Promise.all(
      moviesToUpdate.map((movie) =>
        Movies.findOneAndUpdate({ title: movie.title }, movie, { new: true }),
      ),
    );
    const addedMovies = moviesToAdd?.length
      ? await this.AddMovies(moviesToAdd)
      : [];

    return ResponseSchema('Add Movies Successfully', true, {
      addedMovies,
      updatedMovies,
    });
  } catch (err) {
    logger.error(`--------- Error While Setting Movie Data ${err} -----------`);
    throw err;
  }
};

exports.IsMovieNeedSync = (addedMovie, existingMovie) => {
  try {
    const checkedKeys = [
      'director',
      'year',
      'country',
      'length',
      'genre',
      'colour',
    ];

    // Check for changes in standard fields
    if (checkedKeys.some((key) => addedMovie[key] !== existingMovie[key])) {
      return true;
    }

    // Check for changes in additional_info
    if (
      addedMovie?.additional_info?.length !==
      existingMovie?.additional_info?.length
    ) {
      return true;
    }

    // Check each additional_info item
    for (let i = 0; i < addedMovie?.additional_info?.length; i++) {
      const addedInfo = addedMovie?.additional_info?.[i];
      const existingInfo = existingMovie?.additional_info?.[i];
      if (
        addedInfo.info_type !== existingInfo.info_type ||
        addedInfo.info_value !== existingInfo.info_value
      ) {
        return true;
      }
    }
  } catch (err) {
    logger.error(
      `--------- Error While Is Movie Need Sync Checking Due To ${err} -----------`,
    );
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

exports.GetAllMovies = async (query = {}) => {
  try {
    logger.info('--------- Get All Movies -----------');
    const movies = await Movies.find(query);
    logger.info('--------- Get All Movies Successfully -----------');
    return movies;
  } catch (err) {
    logger.error(
      `--------- Error While Getting All Movies Due To ${err} -----------`,
    );
    throw err;
  }
};

exports.GetAllMoviesPaginated = async (
  page,
  itemPerPage,
  searchedQuery = {},
) => {
  try {
    logger.info('--------- Get All Movies With Pagination -----------');
    const movies = await Movies.find(searchedQuery)
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

exports.GetAllMoviesCount = async (query = {}) => {
  try {
    logger.info('--------- Get All Movies Count -----------');
    const moviesCount = await Movies.find(query).count();
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

exports.GetMovieDetailsFromTMDB = async (name, year) => {
  try {
    logger.info('--------- Get Movie From TMDB -----------');
    const movie = await axios.get(
      `${process.env.TMPD_API_URL}/search/movie?query=${name}&year=${year}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.TMPD_API_TOKEN}`,
        },
      },
    );
    logger.info('--------- Get Movie From TMDB Successfully -----------');
    return movie?.data?.results?.[0];
  } catch (err) {
    logger.error(
      `--------- Error While Getting Movie From TMDB Due To ${err} -----------`,
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

exports.SetMoviesSearchedQueryObject = (query = {}) => {
  try {
    const { title, genre } = query;
    let searchedQuery = {};
    if (title) {
      searchedQuery = {
        ...searchedQuery,
        title: { $regex: title, $options: 'i' },
      };
    }
    if (genre) {
      searchedQuery = {
        ...searchedQuery,
        genre: { $regex: genre, $options: 'i' },
      };
    }
    return searchedQuery;
  } catch (err) {
    logger.error(
      `--------- Error While Setting Movies Searched Query Object Due To ${err} -----------`,
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

exports.SyncMovieDetailsWithTMDB = async (id) => {
  try {
    logger.info('--------- Sync Movie Details With TMBD -----------');
    const movie = await Movies.findById(id);
    if (movie?.tmdb_additional_info?.length) return;

    const movieDetailsTMBD = await this.GetMovieDetailsFromTMDB(
      movie?.title,
      movie?.year,
    );
    const usedKeys = [
      'adult',
      'backdrop_path',
      'id',
      'original_language',
      'original_title',
      'overview',
      'popularity',
      'video',
      'vote_average',
      'vote_count',
    ];

    const tmdbAdditionalInfo = usedKeys?.map((key) => {
      return {
        info_type: key,
        info_value: movieDetailsTMBD[key],
      };
    });
    const updatedMovieData = {
      tmdb_additional_info: tmdbAdditionalInfo,
    };

    await this.UpdateMovie(id, updatedMovieData);

    logger.info(
      '--------- Sync Movie Details With TMBD Successfully -----------',
    );
    return movie;
  } catch (err) {
    logger.error(
      `--------- Error While Syncing Movie Details With TMBD  Due To ${err} -----------`,
    );
    throw err;
  }
};
