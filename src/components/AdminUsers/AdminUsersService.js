const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { logger } = require('../../config/logger');
const { ResponseSchema } = require('../../helper/HelperFunctions');
const { AdminUsers } = require('./AdminUsersModel');

exports.AddAdminUser = async (data) => {
  try {
    logger.info('--------- Start Add Admin User -----------');
    const addedUser = await AdminUsers.create(data);
    logger.info('--------- Finish Add User Successfully -----------');
    return addedUser;
  } catch (err) {
    logger.error(
      `--------- Error While Adding Admin User Due To ${err} -----------`,
    );
    throw err;
  }
};

exports.UpdateAdminUser = async (id, data) => {
  try {
    logger.info('--------- Update Admin User By Id -----------');
    const user = await AdminUsers.findByIdAndUpdate(id, data);
    logger.info('--------- Update Admin User By Id Successfully -----------');
    return user;
  } catch (err) {
    logger.error(
      `--------- Error While Updating Admin User By Id Due To ${err} -----------`,
    );
    throw err;
  }
};

exports.GetAllAdminUsers = async (query = {}, selectedKeys = {}) => {
  try {
    logger.info('--------- Get All Admin Users -----------');
    const users = await AdminUsers.find(query, selectedKeys);
    logger.info('--------- Get All Admin Users Successfully -----------');
    return users;
  } catch (err) {
    logger.error(
      `--------- Error While Getting All Admin Users Due To ${err} -----------`,
    );
    throw err;
  }
};

exports.GetAllAdminUsersPaginated = async (
  page,
  itemPerPage,
  searchedQuery = {},
  selectedKeys = {},
) => {
  try {
    logger.info('--------- Get All Admin Users With Pagination -----------');
    const users = await AdminUsers.find(searchedQuery, selectedKeys)
      .sort({ _id: -1 })
      .skip(page * itemPerPage)
      .limit(itemPerPage);
    logger.info(
      '--------- Get All Admin Users With Pagination Successfully -----------',
    );
    return users;
  } catch (err) {
    logger.error(
      `--------- Error While Getting All Admin Users With Pagination Due To ${err} -----------`,
    );
    throw err;
  }
};

exports.GetAllAdminUsersCount = async (query = {}) => {
  try {
    logger.info('--------- Get All Admin Users Count -----------');
    const usersCount = await AdminUsers.find(query).count();
    logger.info('--------- Get All Admin Users Count Successfully -----------');
    return usersCount;
  } catch (err) {
    logger.error(
      `--------- Error While Getting All Users Count Due To ${err} -----------`,
    );
    throw err;
  }
};

exports.GetAdminUserById = async (id, selectedKeys = {}) => {
  try {
    logger.info('--------- Get Admin User By Id -----------');
    const user = await AdminUsers.findById(id, selectedKeys);
    logger.info('--------- Get Admin User By Id Successfully -----------');
    return user?.toObject();
  } catch (err) {
    logger.error(
      `--------- Error While Getting Admin User By Id Due To ${err} -----------`,
    );
    throw err;
  }
};

exports.LoginAdminUser = async (email, password) => {
  try {
    logger.info('--------- Login Admin User By Query -----------');
    const user = await AdminUsers.findOne({ email });
    if (!user) {
      logger.error("---------- User Admin Email doesn't Exist -------------");
      return ResponseSchema("Admin User Email doesn't Exist", false);
    }

    if (bcrypt.compareSync(password, user?.password)) {
      const generatedLoginToken = this.GenerateAdminUserLoginToken(user);
      const updatedData = {
        api_token: generatedLoginToken,
      };
      await this.UpdateAdminUser(user?._id, updatedData);
      return ResponseSchema('Token', true, generatedLoginToken);
    }

    logger.error('---------- Wrong Admin User Credentials -------------');
    return ResponseSchema('Wrong Admin User Credentials', false);
  } catch (err) {
    logger.error(
      `--------- Error While Getting Admin User By Query Due To ${err} -----------`,
    );
    throw err;
  }
};

exports.GenerateAdminUserLoginToken = (user) => {
  try {
    const token = jwt.sign(
      {
        user_id: user?._id,
        user_type: 'admin',
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

exports.CheckAdminUserExist = async (id, selectedKeys = {}) => {
  try {
    const user = await this.GetAdminUserById(id, selectedKeys);
    if (!user) {
      logger.error('---------- Admin User Id is wrong -------------');
      return ResponseSchema('Admin User Id is wrong', false);
    }
    return ResponseSchema('Admin User', true, user);
  } catch (err) {
    logger.error(
      `--------- Error While Checking Admin User By Id Due To ${err} -----------`,
    );
    throw err;
  }
};

exports.DeleteAdminUser = async (id, req) => {
  try {
    logger.info('--------- Delete Admin User By Id -----------');
    if (req?.authedUser?.user_id === id) {
      logger.error("---------- Admin User Can't Delete Itself -------------");
      return ResponseSchema("Admin User Can't Delete Itself", false);
    }
    const user = await AdminUsers.findByIdAndDelete(id);
    logger.info('--------- Delete Admin User By Id Successfully -----------');
    return ResponseSchema('Admin User', true, user);
  } catch (err) {
    logger.error(
      `--------- Error While Deleteing Admin User By Id Due To ${err} -----------`,
    );
    throw err;
  }
};
