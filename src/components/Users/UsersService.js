const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const {
  ResponseSchema,
  ConvertToObjectId,
} = require('@src/helper/HelperFunctions');
const { Users } = require('./UsersModel');
const { LogInfo, LogError } = require('@src/helper/HelperFunctions');

exports.AddUser = async (data) => {
  try {
    LogInfo('Start Add User');
    const addedUser = await Users.create(data);
    LogInfo('Finish Add User Successfully');
    return addedUser;
  } catch (err) {
    LogError(`Error While Adding User Due To ${err}`);
    throw err;
  }
};

exports.UpdateUser = async (id, data) => {
  try {
    LogInfo('Update User By Id');
    const user = await Users.findByIdAndUpdate(id, data, { new: true });
    LogInfo('Update User By Id Successfully');
    return user;
  } catch (err) {
    LogError(`Error While Updating User By Id Due To ${err}`);
    throw err;
  }
};

exports.GetAllUsers = async (query = {}, selectedKeys = {}) => {
  try {
    LogInfo('Get All Users');
    const users = await Users.find(query, selectedKeys);
    LogInfo('Get All Users Successfully');
    return users;
  } catch (err) {
    LogError(`Error While Getting All Users Due To ${err}`);
    throw err;
  }
};

exports.GetAllUsersPaginated = async (
  page,
  itemPerPage,
  searchedQuery = {},
  selectedKeys = {},
) => {
  try {
    LogInfo('Get All Users With Pagination');
    const users = await Users.find(searchedQuery, selectedKeys)
      .sort({ _id: -1 })
      .skip(page * itemPerPage)
      .limit(itemPerPage);
    LogInfo('Get All Users With Pagination Successfully');
    return users;
  } catch (err) {
    LogError(`Error While Getting All Users With Pagination Due To ${err}`);
    throw err;
  }
};

exports.GetAllUsersCount = async (query = {}) => {
  try {
    LogInfo('Get All Users Count');
    const usersCount = await Users.find(query).count();
    LogInfo('Get All Users Count Successfully');
    return usersCount;
  } catch (err) {
    LogError(`Error While Getting All Users Count Due To ${err}`);
    throw err;
  }
};

exports.GetUserById = async (id, selectedKeys = {}, populate = []) => {
  try {
    LogInfo('Get User By Id');
    const user = await Users.findById(id, selectedKeys).populate(populate);
    LogInfo('Get User By Id Successfully');
    return user?.toObject();
  } catch (err) {
    LogError(`Error While Getting User By Id Due To ${err}`);
    throw err;
  }
};

exports.GetUserByQuery = async (query = {}) => {
  try {
    LogInfo('Get User By Query');
    const user = await Users.findOne(query);
    LogInfo('Get User By Query Successfully');
    return user?.toObject();
  } catch (err) {
    LogError(`Error While Getting User By Query Due To ${err}`);
    throw err;
  }
};

exports.LoginUser = async (email, password) => {
  try {
    LogInfo('Login User By Query');
    const user = await Users.findOne({ email });
    if (!user) {
      LogError("User Email doesn't Exist");
      return ResponseSchema("User Email doesn't Exist", false);
    }

    if (bcrypt.compareSync(password, user?.password)) {
      const generatedLoginToken = this.GenerateUserLoginToken(user);
      const updatedData = {
        api_token: generatedLoginToken,
      };
      await this.UpdateUser(user?._id, updatedData);
      return ResponseSchema('Token', true, generatedLoginToken);
    }

    LogError('Wrong User Credentials');
    return ResponseSchema('Wrong User Credentials', false);
  } catch (err) {
    LogError(`Error While Getting User By Query Due To ${err}`);
    throw err;
  }
};

exports.GenerateUserLoginToken = (user) => {
  try {
    const token = jwt.sign(
      {
        user_id: user?._id,
        user_type: 'user',
      },
      process.env.JWT_SECRET,
    );

    return token;
  } catch (err) {
    LogError(`Error While Generating Token Due To ${err}`);
    throw err;
  }
};

exports.CheckUserExist = async (id, selectedKeys = {}) => {
  try {
    const user = await this.GetUserById(id, selectedKeys);
    if (!user) {
      LogError('User Id is wrong');
      return ResponseSchema('User Id is wrong', false);
    }
    return ResponseSchema('User', true, user);
  } catch (err) {
    LogError(`Error While Checking User By Id Due To ${err}`);
    throw err;
  }
};

exports.CheckMovieInUserFavorite = async (id, movieId) => {
  try {
    const user = await this.GetUserById(id);
    if (!user) {
      LogError('User Id is wrong');
      return ResponseSchema('User Id is wrong', false);
    }

    let itemExistInUserFavoriteds = false;
    const movieObjectId = ConvertToObjectId(movieId);
    if (
      user.favorites_movies.some((favMovie) => favMovie.equals(movieObjectId))
    ) {
      itemExistInUserFavoriteds = true;
    }

    return itemExistInUserFavoriteds;
  } catch (err) {
    LogError(`Error While Checking Movie In User Favorite Due To ${err}`);
    throw err;
  }
};

exports.DeleteUser = async (id) => {
  try {
    LogInfo('Delete User By Id');
    const user = await Users.findByIdAndDelete(id);
    LogInfo('Delete User By Id Successfully');
    return user;
  } catch (err) {
    LogError(`Error While Deleteing User By Id Due To ${err}`);
    throw err;
  }
};
