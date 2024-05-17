const bcrypt = require('bcrypt');
const { ErrorHandler } = require('@src/helper/ErrorHandler');
const { LogInfo, LogError } = require('@src/helper/HelperFunctions');

const {
  ResponseSchema,
  PaginateSchema,
  CheckValidIdObject,
} = require('@src/helper/HelperFunctions');
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
    LogInfo('Start Add User');
    const addedUserData = {
      name,
      email,
      password: bcrypt.hashSync(password, bcrypt.genSaltSync()),
    };

    const addedUser = await AddUser(addedUserData);
    LogInfo('End Add User Successfully');

    return res
      .status(201)
      .json(ResponseSchema('User Added Successfully', true, addedUser));
  } catch (err) {
    LogError(`Error On Add User Due To: ${err}`);
    return res
      .status(400)
      .json(
        ResponseSchema(
          `Somethings Went wrong Due To :${err.message}`,
          false,
          ErrorHandler(err),
        ),
      );
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const { id } = req.params;
    LogInfo('Start Update User');
    if (!CheckValidIdObject(req, res, id, 'User Id is Invalid')) return;
    const user = await CheckUserExist(id);
    if (!user.status) {
      return res.status(404).json(ResponseSchema(user.message, false));
    }
    if (req?.authedUser?.user_type === 'user') {
      if (req?.authedUser?.user_id !== id) {
        return res
          .status(400)
          .json(
            ResponseSchema(
              "You don't Have Permission To Update Other Users",
              false,
            ),
          );
      }
    }
    if (!(user?.data?._id).equals(id)) {
      return res.status(404).json(ResponseSchema(user.message, false));
    }
    const updatedUserData = {
      name,
      email,
      password: password && bcrypt.hashSync(password, bcrypt.genSaltSync()),
    };

    const updatedUser = await UpdateUser(id, updatedUserData);
    LogInfo('End Update User Successfully');

    return res
      .status(201)
      .json(ResponseSchema('User Updated Successfully', true, updatedUser));
  } catch (err) {
    LogError(`Error On Update User To: ${err}`);
    return res
      .status(400)
      .json(
        ResponseSchema(
          `Somethings Went wrong Due To :${err.message}`,
          false,
          ErrorHandler(err),
        ),
      );
  }
};

exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    LogInfo(`User with ID ${id}`);

    if (!CheckValidIdObject(req, res, id, 'User Id is Invalid')) return;
    const user = await CheckUserExist(id, { password: 0 });
    if (!user.status) {
      return res.status(404).json(ResponseSchema(user.message, false));
    }
    if (req?.authedUser?.user_type === 'user') {
      if (req?.authedUser?.user_id !== id) {
        return res
          .status(404)
          .json(
            ResponseSchema(
              "You don't Have Permission To Show Other Users Data",
              false,
            ),
          );
      }
    }
    return res.status(200).json(ResponseSchema('User', true, user?.data));
  } catch (err) {
    LogError(`Error On Getting User By ID ${err}`);
    return res
      .status(400)
      .json(
        ResponseSchema(
          `Something went wrong: ${err.message}`,
          false,
          ErrorHandler(err),
        ),
      );
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    LogInfo('All Users');
    const users = await GetAllUsers({}, { password: 0 });
    return res.status(200).json(ResponseSchema('Users', true, users));
  } catch (err) {
    LogError(`Error On Getting All Users Due To: ${err}`);
    return res
      .status(400)
      .json(
        ResponseSchema(
          `Somethings Went wrong Due To :${err.message}`,
          false,
          ErrorHandler(err),
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

    LogInfo('All Users With Pagination');
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
    LogError(`Error On Getting All Users With Pagination Due To: ${err}`);
    return res
      .status(400)
      .json(
        ResponseSchema(
          `Somethings Went wrong Due To :${err.message}`,
          false,
          ErrorHandler(err),
        ),
      );
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const loggedStatus = await LoginUser(email, password);
    if (!loggedStatus.status) {
      return res.status(404).json(ResponseSchema(loggedStatus?.message, false));
    }
    LogInfo('User Logged Successfully');
    return res.status(201).json(
      ResponseSchema('User Logged Successfully', true, {
        token: loggedStatus?.data,
      }),
    );
  } catch (err) {
    LogError(`Error On Login User To: ${err}`);
    return res
      .status(400)
      .json(
        ResponseSchema(
          `Somethings Went wrong Due To :${err.message}`,
          false,
          ErrorHandler(err),
        ),
      );
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    LogInfo('Start User Deleteing');
    if (!CheckValidIdObject(req, res, id, 'User Id is Invalid')) return;
    const user = await CheckUserExist(id);
    if (!user.status) {
      return res.status(404).json(ResponseSchema(user.message, false));
    }
    await DeleteUser(id);
    LogInfo('User Deleted Successfully');
    return res
      .status(201)
      .json(ResponseSchema('User Deleted Successfully', true));
  } catch (err) {
    LogError(`Error On Deleteing User Due To: ${err}`);
    return res
      .status(400)
      .json(
        ResponseSchema(
          `Somethings Went wrong Due To :${err.message}`,
          false,
          ErrorHandler(err),
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

      LogInfo('Movie Removed From Favorites Successfully');
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
    LogInfo('Movie Added To Favorites Successfully');
    return res
      .status(201)
      .json(ResponseSchema('Movie Added To Favorites Successfully', true));
  } catch (err) {
    LogError(`Error On Addeing Or Removieg Movie In Favorite Due To: ${err}`);
    return res
      .status(400)
      .json(
        ResponseSchema(
          `Somethings Went wrong Due To :${err.message}`,
          false,
          ErrorHandler(err),
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
    LogError(`Error On Get All User Favorited Movies Due To: ${err}`);
    return res
      .status(400)
      .json(
        ResponseSchema(
          `Somethings Went wrong Due To :${err.message}`,
          false,
          ErrorHandler(err),
        ),
      );
  }
};
