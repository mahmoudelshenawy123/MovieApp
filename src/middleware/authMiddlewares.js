const { ResponseSchema } = require('@src/helper/HelperFunctions');
const jwt = require('jsonwebtoken');
const { LogError } = require('@src/helper/HelperFunctions');
const {
  GetAdminUserByQuery,
} = require('@src/components/AdminUsers/AdminUsersService');
const { GetUserByQuery } = require('../components/Users/UsersService');

exports.isAuthorized = (usertypes) => (req, res, next) => {
  if (usertypes?.includes(req?.authedUser?.user_type)) {
    next();
  } else {
    LogError('Unauthorized');
    return res.status(401).json(ResponseSchema('Unauthorized', false));
  }
};

exports.DecodeToken = (req, res, next) => {
  const token = req?.headers?.authorization?.split(' ')?.[1];
  const authedUser = jwt.decode(token);
  req.authedUser = authedUser;
  next();
};

exports.CheckUserToken = async (req, res, next) => {
  const token = req?.headers?.authorization?.split(' ')?.[1];
  if (token) {
    if (req?.authedUser?.user_type === 'user') {
      const user = await GetUserByQuery({ api_token: token });
      if (user && user?._id?.equals(req?.authedUser?.user_id)) {
        next();
      }
    } else if (req?.authedUser?.user_type === 'admin') {
      const user = await GetAdminUserByQuery({ api_token: token });
      if (user && user?._id?.equals(req?.authedUser?.user_id)) {
        next();
      }
    }
    return res.status(401).json(ResponseSchema('This Token Is Expired', false));
  } else {
    next();
  }
};
