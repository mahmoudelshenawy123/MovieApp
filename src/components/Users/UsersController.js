const bcrypt = require('bcrypt');
const { logger } = require('../../config/logger');
const { errorHandler } = require('../../helper/ErrorHandler');
const {
  ResponseSchema,
  PaginateSchema,
  CheckValidIdObject,
} = require('../../helper/HelperFunctions');
const {
  AddUser,
  CheckUserExist,
  UpdateUser,
  GetAllUsers,
  GetAllUsersCount,
  GetAllUsersPaginated,
  DeleteUser,
  LoginUser,
  CheckMovieInUserFavorite,
  GetUserById,
} = require('./UsersService');
const { SyncMovieDetailsWithTMDB } = require('../Movies/MoviesService');

exports.addUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    logger.info('--------- Start Add User -----------');
    const addedUserData = {
      name,
      email,
      password: bcrypt.hashSync(password, bcrypt.genSaltSync()),
    };

    const addedUser = await AddUser(addedUserData);
    logger.info('--------- End Add User Successfully -----------');

    return res
      .status(201)
      .json(ResponseSchema('User Added Successfully', true, addedUser));
  } catch (err) {
    console.log(err);
    logger.error(`---------- Error On Add User Due To: ${err} -------------`);
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

exports.updateUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const { id } = req.params;
    logger.info('--------- Start Update User -----------');
    if (!CheckValidIdObject(req, res, id, 'User Id is Invalid')) return;
    const user = await CheckUserExist(id);
    if (!user.status) {
      res.status(404).json(ResponseSchema(user.message, false));
      return;
    }
    const updatedUserData = {
      name,
      email,
      password: password && bcrypt.hashSync(password, bcrypt.genSaltSync()),
    };

    const updatedUser = await UpdateUser(id, updatedUserData);
    logger.info('--------- End Update User Successfully -----------');

    res
      .status(201)
      .json(ResponseSchema('User Updated Successfully', true, updatedUser));
    return;
  } catch (err) {
    console.log(err);
    logger.error(`---------- Error On Update User To: ${err} -------------`);
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

exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    logger.info(`------------------ User with ID ${id} -----------------`);

    if (!CheckValidIdObject(req, res, id, 'User Id is Invalid')) return;
    const user = await CheckUserExist(id, { password: 0 });
    if (!user.status) {
      res.status(404).json(ResponseSchema(user.message, false));
      return;
    }
    return res.status(200).json(ResponseSchema('User', true, user?.data));
  } catch (err) {
    console.log(err);
    logger.error(`---------- Error On Getting User By ID ${err} -------------`);
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

exports.getAllUsers = async (req, res) => {
  try {
    logger.info('------------------ All Users -----------------');
    const users = await GetAllUsers({}, { password: 0 });
    return res.status(200).json(ResponseSchema('Users', true, users));
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

exports.getAllUsersWithPagination = async (req, res) => {
  try {
    const page = req.query.page - 1 || 0;
    const itemPerPage = req.query.limit || 10;
    const count = await GetAllUsersCount();
    const pages = Math.ceil(count / itemPerPage);

    logger.info(
      '------------------ All Users With Pagination -----------------',
    );
    const users = await GetAllUsersPaginated(
      page,
      itemPerPage,
      {},
      {
        password: 0,
      },
    );
    return res
      .status(200)
      .json(
        ResponseSchema(
          'Users',
          true,
          PaginateSchema(page + 1, pages, count, users),
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

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const token = await LoginUser(email, password);

    logger.info(
      '------------------ User Logged Successfully -----------------',
    );
    res
      .status(201)
      .json(ResponseSchema('User Logged Successfully', true, { token }));
  } catch (err) {
    console.log(err);
    logger.error(`---------- Error On Login User To: ${err} -------------`);
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

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    logger.info('------------------ Start User Deleteing -----------------');
    if (!CheckValidIdObject(req, res, id, 'User Id is Invalid')) return;
    const user = await CheckUserExist(id);
    if (!user.status) {
      res.status(404).json(ResponseSchema(user.message, false));
      return;
    }
    await DeleteUser(id);
    logger.info(
      '------------------ User Deleted Successfully -----------------',
    );
    res.status(201).json(ResponseSchema('User Deleted Successfully', true));
    return;
  } catch (err) {
    console.log(err);
    logger.error(
      `---------- Error On Deleteing User Due To: ${err} -------------`,
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

exports.toggleMovieInFavorite = async (req, res) => {
  try {
    const { favoriteMovieId } = req.body;
    const { user_id } = req.authedUser;

    if (!CheckValidIdObject(req, res, user_id, 'User Id is Invalid')) return;
    if (!CheckValidIdObject(req, res, favoriteMovieId, 'Movie Id is Invalid'))
      return;
    const isMovieAdded = await CheckMovieInUserFavorite(
      user_id,
      favoriteMovieId,
    );
    if (isMovieAdded) {
      const updatedData = {
        $pull: {
          favorites_movies: favoriteMovieId,
        },
      };
      await UpdateUser(user_id, updatedData);

      logger.info(
        '------------------ Movie Removed From Favorites Successfully -----------------',
      );
      return res
        .status(201)
        .json(
          ResponseSchema('Movie Removed From Favorites Successfully', true),
        );
    }
    const updatedData = {
      $addToSet: {
        favorites_movies: favoriteMovieId,
      },
    };
    await UpdateUser(user_id, updatedData);
    await SyncMovieDetailsWithTMDB(favoriteMovieId);
    logger.info(
      '------------------ Movie Added To Favorites Successfully -----------------',
    );
    return res
      .status(201)
      .json(ResponseSchema('Movie Added To Favorites Successfully', true));
  } catch (err) {
    console.log(err);
    logger.error(
      `---------- Error On Addeing Or Removieg Movie In Favorite Due To: ${err} -------------`,
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

exports.getAllUserFavoritedMoviesPaginated = async (req, res) => {
  try {
    const { user_id } = req.authedUser;
    if (!CheckValidIdObject(req, res, user_id, 'User Id is Invalid')) return;

    const populateOptions = [
      {
        path: 'favorites_movies',
        // select: 'title genre',
      },
    ];
    const user = await GetUserById(user_id, {}, populateOptions);
    if (!user) {
      return res
        .status(403)
        .json(
          ResponseSchema(
            req.t("You Don't Have Permission To Show Favorited Movies"),
            false,
          ),
        );
    }

    const page = req.query.page - 1 || 0;
    const itemPerPage = req.query.limit || 10;
    const count = user?.favorites_movies?.length;
    const pages = Math.ceil(count / itemPerPage);

    const sendedObject = user?.favorites_movies;

    return res
      .status(200)
      .json(
        ResponseSchema(
          'Users Movies',
          true,
          PaginateSchema(page + 1, pages, count, sendedObject),
        ),
      );
  } catch (err) {
    console.log(err);
    logger.error(
      `---------- Error On Get All User Favorited Movies Due To: ${err} -------------`,
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
