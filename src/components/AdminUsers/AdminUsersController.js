const bcrypt = require('bcrypt');
const { errorHandler } = require('@src/helper/ErrorHandler');
const {
  ResponseSchema,
  PaginateSchema,
  CheckValidIdObject,
  LogInfo,
  LogError,
} = require('@src/helper/HelperFunctions');
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
    LogInfo('Start Add Admin User');
    const addedAdminUserData = {
      name,
      email,
      password: bcrypt.hashSync(password, bcrypt.genSaltSync()),
    };

    const addedUser = await AddAdminUser(addedAdminUserData);
    LogInfo('End Add Admin User Successfully');
    return res
      .status(201)
      .json(ResponseSchema('Admin User Added Successfully', true, addedUser));
  } catch (err) {
    LogError(`Error On Add Admin User Due To: ${err}`);
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
    LogInfo('Start Update Admin User');
    if (!CheckValidIdObject(req, res, id, 'Admin User Id is Invalid')) return;
    const user = await CheckAdminUserExist(id);
    if (!user.status) {
      return res.status(404).json(ResponseSchema(user.message, false));
    }
    const updatedAdminUserData = {
      name,
      email,
      password: password && bcrypt.hashSync(password, bcrypt.genSaltSync()),
    };

    const updatedUser = await UpdateAdminUser(id, updatedAdminUserData);

    LogInfo('End Update Admin User Successfully');
    return res
      .status(201)
      .json(
        ResponseSchema('Admin User Updated Successfully', true, updatedUser),
      );
  } catch (err) {
    LogError(`Error On Update Admin User To: ${err}`);
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

exports.getAdminUserById = async (req, res) => {
  try {
    const { id } = req.params;

    LogInfo(`Admin User with ID ${id}`);
    if (!CheckValidIdObject(req, res, id, 'Admin User Id is Invalid')) return;
    const user = await CheckAdminUserExist(id, { password: 0 });
    if (!user.status) {
      return res.status(404).json(ResponseSchema(user.message, false));
    }
    return res.status(200).json(ResponseSchema('Admin User', true, user?.data));
  } catch (err) {
    LogError(`Error On Getting Admin User By ID ${err}`);
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
    LogInfo('All Admin Users');
    const users = await GetAllAdminUsers({}, { password: 0 });
    return res.status(200).json(ResponseSchema('Users', true, users));
  } catch (err) {
    LogError(`Error On Getting All Admin Users Due To: ${err}`);
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

    LogInfo('All Admin Users With Pagination');

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
    LogError(`Error On Getting All Admin With Pagination Due To: ${err}`);
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
      return res.status(404).json(ResponseSchema(loggedStatus?.message, false));
    }
    LogInfo('Admin User Logged Successfully');
    return res.status(201).json(
      ResponseSchema('Admin User Logged Successfully', true, {
        token: loggedStatus?.data,
      }),
    );
  } catch (err) {
    LogError(`Error On Login Admin User To: ${err}`);
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

exports.deleteAdminUser = async (req, res) => {
  try {
    const { id } = req.params;
    LogInfo(`Start Admin User Deleteing`);
    if (!CheckValidIdObject(req, res, id, 'Admin User Id is Invalid')) return;
    const user = await CheckAdminUserExist(id);
    if (!user.status) {
      return res.status(404).json(ResponseSchema(user.message, false));
    }
    const deletedStatus = await DeleteAdminUser(id, req);
    if (!deletedStatus.status) {
      return res
        .status(404)
        .json(ResponseSchema(deletedStatus?.message, false));
    }
    LogInfo(`Admin User Deleted Successfully`);
    return res
      .status(201)
      .json(ResponseSchema('Admin User Deleted Successfully', true));
  } catch (err) {
    LogError(`Error On Deleteing Admin User Due To: ${err}`);

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
