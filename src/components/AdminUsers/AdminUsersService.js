const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const {
  ResponseSchema,
  LogInfo,
  LogError,
} = require('@src/helper/HelperFunctions');
const { AdminUsers } = require('./AdminUsersModel');

exports.AddAdminUser = async (data) => {
  try {
    LogInfo(`Start Add Admin User`);
    const addedUser = await AdminUsers.create(data);
    LogInfo(`Finish Add User Successfully`);
    return addedUser;
  } catch (err) {
    LogError(`Error While Adding Admin User Due To ${err}`);
    throw err;
  }
};

exports.UpdateAdminUser = async (id, data) => {
  try {
    LogInfo(`Update Admin User By Id`);
    const user = await AdminUsers.findByIdAndUpdate(id, data, { new: true });
    LogInfo(`Update Admin User By Id Successfully`);
    return user;
  } catch (err) {
    LogError(`Error While Updating Admin User By Id Due To ${err}`);
    throw err;
  }
};

exports.GetAllAdminUsers = async (query = {}, selectedKeys = {}) => {
  try {
    LogInfo(`Get All Admin Users`);
    const users = await AdminUsers.find(query, selectedKeys);
    LogInfo(`Get All Admin Users Successfully`);
    return users;
  } catch (err) {
    LogError(`Error While Getting All Admin Users Due To ${err}`);
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
    LogInfo(`Get All Admin Users With Pagination`);
    const users = await AdminUsers.find(searchedQuery, selectedKeys)
      .sort({ _id: -1 })
      .skip(page * itemPerPage)
      .limit(itemPerPage);

    LogInfo(`Get All Admin Users With Pagination Successfully`);
    return users;
  } catch (err) {
    LogError(
      `Error While Getting All Admin Users With Pagination Due To ${err}`,
    );
    throw err;
  }
};

exports.GetAllAdminUsersCount = async (query = {}) => {
  try {
    LogInfo(`Get All Admin Users Count`);
    const usersCount = await AdminUsers.find(query).count();
    LogInfo(`Get All Admin Users Count Successfully`);
    return usersCount;
  } catch (err) {
    LogError(`Error While Getting All Users Count Due To ${err}`);
    throw err;
  }
};

exports.GetAdminUserById = async (id, selectedKeys = {}) => {
  try {
    LogInfo(`Get Admin User By Id`);
    const user = await AdminUsers.findById(id, selectedKeys);
    LogInfo(`Get Admin User By Id Successfully`);
    return user?.toObject();
  } catch (err) {
    LogError(`Error While Getting Admin User By Id Due To ${err}`);
    throw err;
  }
};

exports.LoginAdminUser = async (email, password) => {
  try {
    LogInfo(`Login Admin User By Query`);
    const user = await AdminUsers.findOne({ email });
    if (!user) {
      LogError(`User Admin Email doesn't Exist`);
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

    LogError(`Wrong Admin User Credentials`);
    return ResponseSchema('Wrong Admin User Credentials', false);
  } catch (err) {
    LogError(`Error While Getting Admin User By Query Due To ${err}`);
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
    LogError(`Error While Generating Token Due To ${err}`);
    throw err;
  }
};

exports.CheckAdminUserExist = async (id, selectedKeys = {}) => {
  try {
    const user = await this.GetAdminUserById(id, selectedKeys);
    if (!user) {
      LogError(`Admin User Id is wrong`);
      return ResponseSchema('Admin User Id is wrong', false);
    }
    return ResponseSchema('Admin User', true, user);
  } catch (err) {
    LogError(`Error While Checking Admin User By Id Due To ${err}`);
    throw err;
  }
};

exports.DeleteAdminUser = async (id, req) => {
  try {
    LogInfo(`Delete Admin User By Id`);
    if (req?.authedUser?.user_id === id) {
      LogError(`Admin User Can't Delete Itself`);
      return ResponseSchema("Admin User Can't Delete Itself", false);
    }
    const user = await AdminUsers.findByIdAndDelete(id);
    LogInfo(`Delete Admin User By Id Successfully`);
    return ResponseSchema('Admin User', true, user);
  } catch (err) {
    LogError(`Error While Deleteing Admin User By Id Due To ${err}`);
    throw err;
  }
};
