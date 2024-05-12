const bcrypt = require('bcrypt');
const { logger } = require('../../config/logger');
const { errorHandler } = require('../../helper/ErrorHandler');
const {
  ResponseSchema,
  PaginateSchema,
  CheckValidIdObject,
} = require('../../helper/HelperFunctions');
const {
  AddAdminUser,
  CheckAdminUserExist,
  UpdateAdminUser,
  GetAllAdminUsers,
  GetAllAdminUsersCount,
  GetAllAdminUsersPaginated,
  LoginAdminUser,
  DeleteAdminUser,
} = require('./AdminUsersService');

exports.addAdminUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    logger.info('--------- Start Add Admin User -----------');
    const addedAdminUserData = {
      name,
      email,
      password: bcrypt.hashSync(password, bcrypt.genSaltSync()),
    };

    const addedUser = await AddAdminUser(addedAdminUserData);
    logger.info('--------- End Add Admin User Successfully -----------');

    return res
      .status(201)
      .json(ResponseSchema('Admin User Added Successfully', true, addedUser));
  } catch (err) {
    console.log(err);
    logger.error(
      `---------- Error On Add Admin User Due To: ${err} -------------`,
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

exports.updateAdminUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const { id } = req.params;
    logger.info('--------- Start Update Admin User -----------');
    if (!CheckValidIdObject(req, res, id, 'Admin User Id is Invalid')) return;
    const user = await CheckAdminUserExist(id);
    if (!user.status) {
      res.status(404).json(ResponseSchema(user.message, false));
      return;
    }
    const updatedAdminUserData = {
      name,
      email,
      password: password && bcrypt.hashSync(password, bcrypt.genSaltSync()),
    };

    const updatedUser = await UpdateAdminUser(id, updatedAdminUserData);
    logger.info('--------- End Update Admin User Successfully -----------');

    res
      .status(201)
      .json(
        ResponseSchema('Admin User Updated Successfully', true, updatedUser),
      );
    return;
  } catch (err) {
    console.log(err);
    logger.error(
      `---------- Error On Update Admin User To: ${err} -------------`,
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

exports.getAdminUserById = async (req, res) => {
  try {
    const { id } = req.params;
    logger.info(
      `------------------ Admin User with ID ${id} -----------------`,
    );

    if (!CheckValidIdObject(req, res, id, 'Admin User Id is Invalid')) return;
    const user = await CheckAdminUserExist(id, { password: 0 });
    if (!user.status) {
      res.status(404).json(ResponseSchema(user.message, false));
      return;
    }
    return res.status(200).json(ResponseSchema('Admin User', true, user?.data));
  } catch (err) {
    console.log(err);
    logger.error(
      `---------- Error On Getting Admin User By ID ${err} -------------`,
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

exports.getAllAdminUsers = async (req, res) => {
  try {
    logger.info('------------------ All Admin Users -----------------');
    const users = await GetAllAdminUsers({}, { password: 0 });
    return res.status(200).json(ResponseSchema('Users', true, users));
  } catch (err) {
    console.log(err);
    logger.error(
      `---------- Error On Getting All Admin Users Due To: ${err} -------------`,
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

exports.getAllAdminUsersWithPagination = async (req, res) => {
  try {
    const page = req.query.page - 1 || 0;
    const itemPerPage = req.query.limit || 10;
    const count = await GetAllAdminUsersCount();
    const pages = Math.ceil(count / itemPerPage);

    logger.info(
      '------------------ All Admin Users With Pagination -----------------',
    );
    const users = await GetAllAdminUsersPaginated(
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
          'Admin Users',
          true,
          PaginateSchema(page + 1, pages, count, users),
        ),
      );
  } catch (err) {
    console.log(err);
    logger.error(
      `---------- Error On Getting All Admin With Pagination Due To: ${err} -------------`,
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
    const loggedStatus = await LoginAdminUser(email, password);
    if (!loggedStatus.status) {
      res.status(404).json(ResponseSchema(loggedStatus?.message, false));
      return;
    }
    logger.info(
      '------------------ Admin User Logged Successfully -----------------',
    );
    res.status(201).json(
      ResponseSchema('Admin User Logged Successfully', true, {
        token: loggedStatus?.data,
      }),
    );
  } catch (err) {
    console.log(err);
    logger.error(
      `---------- Error On Login Admin User To: ${err} -------------`,
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

exports.deleteAdminUser = async (req, res) => {
  try {
    const { id } = req.params;

    logger.info(
      '------------------ Start Admin User Deleteing -----------------',
    );
    if (!CheckValidIdObject(req, res, id, 'Admin User Id is Invalid')) return;
    const user = await CheckAdminUserExist(id);
    if (!user.status) {
      res.status(404).json(ResponseSchema(user.message, false));
      return;
    }
    const deletedStatus = await DeleteAdminUser(id, req);
    if (!deletedStatus.status) {
      res.status(404).json(ResponseSchema(deletedStatus?.message, false));
      return;
    }
    logger.info(
      '------------------ Admin User Deleted Successfully -----------------',
    );
    res
      .status(201)
      .json(ResponseSchema('Admin User Deleted Successfully', true));
    return;
  } catch (err) {
    console.log(err);
    logger.error(
      `---------- Error On Deleteing Admin User Due To: ${err} -------------`,
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
