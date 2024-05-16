const XLSX = require('xlsx');
const { default: axios } = require('axios');
const { logger } = require('@src/config/logger');
const {
  ResponseSchema,
  LogError,
  LogInfo,
} = require('@src/helper/HelperFunctions');
const { Movies } = require('./MoviessModel');
const {
  removeFromCache,
  setInCache,
  getFromCache,
} = require('@src/helper/Cache');
const { MOVIES_CACHE } = require('@src/constants/Keys');

exports.GetMoviesFromCSVFile = async (file) => {
  try {
    LogInfo(`Start Get Movies From CSV File`);
    if (!file) {
      LogError(`File Is Required`);
      return ResponseSchema('File is required.', false);
    }

    const extension = file.originalname.split('.').pop().toLowerCase();
    const allowed = ['xls', 'xlsx', 'csv'];

    if (allowed.indexOf(extension) === -1) {
      LogError(
        `File type is not supported. file type must be .xlsx or .xls or .csv`,
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
    LogInfo(`Finish Get Movies From CSV File Successfully`);
    return ResponseSchema('Added Data', true, moviesData);
  } catch (err) {
    LogError(`Error While Getting Movies From CSV File ${err?.message}`);
    throw ResponseSchema(err?.message, true, err);
  }
};

exports.SetAddedMovieData = (movie, newAddedFieldsKeys = []) => {
  try {
    LogInfo(`Start Setting Added Movie Data`);

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

    LogInfo(`Finish Setting Added Movie Data Successfully`);
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
    LogError(`Error While Setting Movie Data ${err}`);
    throw err;
  }
};

exports.AddMoviesFromFile = async (file, newAddedFieldsKeys = []) => {
  try {
    const moviesData = await this.GetMoviesFromCSVFile(file);
    if (!moviesData?.status) {
      LogInfo(
        `Error While Getting Movies From CSV Due To ${moviesData?.message}`,
      );
      return moviesData;
    }

    const addedMoviesData = moviesData?.data?.map((movie) =>
      this.SetAddedMovieData(movie, newAddedFieldsKeys),
    );

    const syncedData = await this.SyncMoviesWithDB(addedMoviesData);

    return ResponseSchema('Add Movies Successfully', true, syncedData);
  } catch (err) {
    LogError(`Error While Setting Movie Data ${err}`);
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

    this.RemoveMovieCache();
    return ResponseSchema('Add Movies Successfully', true, {
      addedMovies,
      updatedMovies,
    });
  } catch (err) {
    LogError(`Error While Setting Movie Data ${err}`);
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
    LogError(`Error While Is Movie Need Sync Checking Due To ${err}`);
    throw err;
  }
};

exports.AddMovies = async (data) => {
  try {
    LogInfo(`Start Add Movies`);
    const addedMovies = await Movies.create(data);
    LogInfo(`Finish Add Movies Successfully`);

    this.RemoveMovieCache();

    return addedMovies;
  } catch (err) {
    LogError(`Error While Adding Movies Due To ${err}`);
    throw err;
  }
};

exports.AddMovie = async (data) => {
  try {
    LogInfo(`Start Add Movie`);
    const addedMovie = await Movies.create(data);
    LogInfo(`Finish Add Movie Successfully`);

    this.RemoveMovieCache();

    return addedMovie;
  } catch (err) {
    LogError(`Error While Adding Movie Due To ${err}`);
    throw err;
  }
};

exports.GetAllMoviesForCache = async () => {
  try {
    LogInfo(`Get All Movies For Cache`);
    const movies = await Movies.find();
    LogInfo(`Get All Movies For Cache Successfully`);

    this.SetMovieCache(movies);

    return movies;
  } catch (err) {
    LogError(`Error While Getting All Movies For Cache Due To ${err}`);
    throw err;
  }
};

exports.GetAllMovies = async (query = {}) => {
  try {
    const cachedMovies = this.GetMovieCache(query);
    if (cachedMovies) {
      return cachedMovies;
    }

    const movies = await this.GetAllMoviesForCache();
    LogInfo(`Get All Movies`);
    const filteredMovies = this.ApplyFilter(movies, query);
    LogInfo(`Get All Movies Successfully`);

    return filteredMovies;
  } catch (err) {
    LogError(`Error While Getting All Movies Due To ${err}`);
    throw err;
  }
};

exports.GetAllMoviesPaginated = async (
  page = 0,
  itemPerPage = 10,
  searchedQuery = {},
) => {
  try {
    let cachedMovies = this.GetMovieCache(searchedQuery);
    if (cachedMovies) {
      cachedMovies = cachedMovies.slice(
        page * itemPerPage,
        (page + 1) * itemPerPage,
      );
      return cachedMovies;
    }

    const movies = await this.GetAllMoviesForCache();
    LogInfo(`Get All Movies With Pagination`);
    let filteredMovies = this.ApplyFilter(movies, searchedQuery);

    filteredMovies = filteredMovies.slice(
      page * itemPerPage,
      (page + 1) * itemPerPage,
    );

    LogInfo(`Get All Movies With Pagination Successfully`);
    return filteredMovies;
  } catch (err) {
    LogError(`Error While Getting All Movies With Pagination Due To ${err}`);
    throw err;
  }
};

exports.GetAllMoviesCount = async (query = {}) => {
  try {
    const cachedMovies = this.GetMovieCache(query);
    if (cachedMovies) {
      return cachedMovies?.length;
    }

    LogInfo(`Get All Movies Count`);
    const movies = await this.GetAllMoviesForCache();
    const moviesCount = this.ApplyFilter(movies, query);
    LogInfo(`Get All Movies Count Successfully`);
    return moviesCount?.length;
  } catch (err) {
    LogError(`Error While Getting All Movies Count Due To ${err}`);
    throw err;
  }
};

exports.GetMovieById = async (id) => {
  try {
    const cachedMovies = this.GetMovieCache();
    if (cachedMovies) {
      return cachedMovies?.find((movie) => movie?._id === id);
    }

    LogInfo(`Get Movie By Id`);
    const movie = await Movies.findById(id);
    LogInfo(`Get Movie By Id Successfully`);
    return movie;
  } catch (err) {
    LogError(`Error While Getting Movie By Id Due To ${err}`);
    throw err;
  }
};

exports.GetMovieForTest = async () => {
  try {
    LogInfo(`Get Movie For Test`);
    const movie = await Movies.findOne({});
    LogInfo(`Get Movie For Test Successfully`);
    return movie;
  } catch (err) {
    LogError(`Error While Getting Movie For Test Due To ${err}`);
    throw err;
  }
};

exports.GetMovieDetailsFromTMDB = async (name, year) => {
  try {
    LogInfo(`Get Movie From TMDB`);
    const movie = await axios.get(
      `${process.env.TMPD_API_URL}/search/movie?query=${name}&year=${year}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.TMPD_API_TOKEN}`,
        },
      },
    );
    LogInfo(`Get Movie From TMDB Successfully`);
    return movie?.data?.results?.[0];
  } catch (err) {
    LogError(`Error While Getting Movie From TMDB Due To ${err}`);
    throw err;
  }
};

exports.CheckMovieExist = async (id) => {
  try {
    const movie = await this.GetMovieById(id);
    if (!movie) {
      LogError(`Movie Id is wrong`);
      return ResponseSchema('Movie Id is wrong', false);
    }
    return ResponseSchema('Movie', true, movie);
  } catch (err) {
    LogError(`Error While Checking Movie By Id Due To ${err}`);
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
        title: title,
      };
    }
    if (genre) {
      searchedQuery = {
        ...searchedQuery,
        genre: genre,
      };
    }
    return searchedQuery;
  } catch (err) {
    LogError(`Error While Setting Movies Searched Query Object Due To ${err}`);
    throw err;
  }
};

exports.SetMoviesSearchedQueryDBObject = (query = {}) => {
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
    LogError(
      `Error While Setting Movies Searched Query DB Object Due To ${err}`,
    );
    throw err;
  }
};

exports.DeleteMovie = async (id) => {
  try {
    LogInfo(`Delete Movie By Id`);
    const movie = await Movies.findByIdAndDelete(id);
    LogInfo(`Delete Movie By Id Successfully`);

    this.RemoveMovieCache();

    return movie;
  } catch (err) {
    LogError(`Error While Deleteing Movie By Id Due To ${err}`);
    throw err;
  }
};

exports.UpdateMovie = async (id, data) => {
  try {
    LogInfo(`Update Movie By Id`);
    const movie = await Movies.findByIdAndUpdate(id, data, { new: true });
    LogInfo(`Update Movie By Id Successfully`);

    this.RemoveMovieCache();

    return movie;
  } catch (err) {
    LogError(`Error While Updating Movie By Id Due To ${err}`);
    throw err;
  }
};

exports.SyncMovieDetailsWithTMDB = async (id) => {
  try {
    LogInfo(`Sync Movie Details With TMBD`);
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

    LogInfo(`Sync Movie Details With TMBD Successfully`);
    return movie;
  } catch (err) {
    LogError(`Error While Syncing Movie Details With TMBD  Due To ${err}`);
    throw err;
  }
};

exports.ApplyFilter = (movies, searchedQuery = {}) => {
  const filteredMovies = movies?.filter((movie) => {
    return Object.keys(searchedQuery).every((key) => {
      return (
        movie[key] && movie[key].match(new RegExp(searchedQuery[key], 'i'))
      );
    });
  });

  return filteredMovies;
};

exports.GetMovieCache = (searchedQuery = {}) => {
  const moviesFromCache = getFromCache(MOVIES_CACHE);
  if (Object.keys(searchedQuery).length === 0) {
    return moviesFromCache;
  }
  const filteredMovies = this.ApplyFilter(moviesFromCache, searchedQuery);
  return filteredMovies;
};

exports.SetMovieCache = (movies) => {
  setInCache(MOVIES_CACHE, movies);
};

exports.RemoveMovieCache = () => {
  removeFromCache(MOVIES_CACHE);
  setTimeout(async () => {
    await this.GetAllMoviesForCache();
  }, 0);
};
