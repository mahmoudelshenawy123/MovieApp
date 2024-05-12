const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { logger } = require('../../config/logger');
const { ResponseSchema } = require('../../helper/HelperFunctions');
const { Users } = require('./UsersModel');

exports.AddUser = async (data) => {
  try {
    logger.info('--------- Start Add User -----------');
    const addedUser = await Users.create(data);
    logger.info('--------- Finish Add User Successfully -----------');
    return addedUser;
  } catch (err) {
    logger.error(`--------- Error While Adding User Due To ${err} -----------`);
    throw err;
  }
};

exports.UpdateUser = async (id, data) => {
  try {
    logger.info('--------- Update User By Id -----------');
    const user = await Users.findByIdAndUpdate(id, data);
    logger.info('--------- Update User By Id Successfully -----------');
    return user;
  } catch (err) {
    logger.error(
      `--------- Error While Updating User By Id Due To ${err} -----------`,
    );
    throw err;
  }
};

exports.GetAllUsers = async (query = {}, selectedKeys = {}) => {
  try {
    logger.info('--------- Get All Users -----------');
    const users = await Users.find(query, selectedKeys);
    logger.info('--------- Get All Users Successfully -----------');
    return users;
  } catch (err) {
    logger.error(
      `--------- Error While Getting All Users Due To ${err} -----------`,
    );
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
    logger.info('--------- Get All Users With Pagination -----------');
    const users = await Users.find(searchedQuery, selectedKeys)
      .sort({ _id: -1 })
      .skip(page * itemPerPage)
      .limit(itemPerPage);
    logger.info(
      '--------- Get All Users With Pagination Successfully -----------',
    );
    return users;
  } catch (err) {
    logger.error(
      `--------- Error While Getting All Users With Pagination Due To ${err} -----------`,
    );
    throw err;
  }
};

exports.GetAllUsersCount = async (query = {}) => {
  try {
    logger.info('--------- Get All Users Count -----------');
    const usersCount = await Users.find(query).count();
    logger.info('--------- Get All Users Count Successfully -----------');
    return usersCount;
  } catch (err) {
    logger.error(
      `--------- Error While Getting All Users Count Due To ${err} -----------`,
    );
    throw err;
  }
};

exports.GetUserById = async (id, selectedKeys = {}, populate = []) => {
  try {
    logger.info('--------- Get User By Id -----------');
    const user = await Users.findById(id, selectedKeys).populate(populate);
    logger.info('--------- Get User By Id Successfully -----------');
    return user.toObject();
  } catch (err) {
    logger.error(
      `--------- Error While Getting User By Id Due To ${err} -----------`,
    );
    throw err;
  }
};

exports.LoginUser = async (email, password) => {
  try {
    logger.info('--------- Login User By Query -----------');
    const user = await Users.findOne({ email });
    if (!user) {
      logger.error("---------- User Email doesn't Exist -------------");
      return ResponseSchema("User Email doesn't Exist", false);
    }

    if (bcrypt.compareSync(password, user?.password)) {
      const generatedLoginToken = this.GenerateUserLoginToken(user);
      const updatedData = {
        api_token: generatedLoginToken,
      };
      await this.UpdateUser(user?._id, updatedData);
      return generatedLoginToken;
    }

    logger.error('---------- Wrong User Credentials -------------');
    return ResponseSchema('Wrong User Credentials', false);
  } catch (err) {
    logger.error(
      `--------- Error While Getting User By Query Due To ${err} -----------`,
    );
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
    logger.error(
      `--------- Error While Generating Token Due To ${err} -----------`,
    );
    throw err;
  }
};

exports.CheckUserExist = async (id, selectedKeys = {}) => {
  try {
    const user = await this.GetUserById(id, selectedKeys);
    if (!user) {
      logger.error('---------- User Id is wrong -------------');
      return ResponseSchema('User Id is wrong', false);
    }
    return ResponseSchema('User', true, user);
  } catch (err) {
    logger.error(
      `--------- Error While Checking User By Id Due To ${err} -----------`,
    );
    throw err;
  }
};

exports.CheckMovieInUserFavorite = async (id, movieId) => {
  try {
    const user = await this.GetUserById(id);
    if (!user) {
      logger.error('---------- User Id is wrong -------------');
      return ResponseSchema('User Id is wrong', false);
    }

    let itemExistInUserFavoriteds = false;
    if (user?.favorites_movies.includes(movieId)) {
      itemExistInUserFavoriteds = true;
    }

    return itemExistInUserFavoriteds;
  } catch (err) {
    logger.error(
      `--------- Error While Checking Movie In User Favorite Due To ${err} -----------`,
    );
    throw err;
  }
};

exports.DeleteUser = async (id) => {
  try {
    logger.info('--------- Delete User By Id -----------');
    const user = await Users.findByIdAndDelete(id);
    logger.info('--------- Delete User By Id Successfully -----------');
    return user;
  } catch (err) {
    logger.error(
      `--------- Error While Deleteing User By Id Due To ${err} -----------`,
    );
    throw err;
  }
};
