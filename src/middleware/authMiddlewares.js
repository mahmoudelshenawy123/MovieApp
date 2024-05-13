const { ResponseSchema } = require('@src/helper/HelperFunctions');
const { LogError } = require('@src/helper/HelperFunctions');

exports.isAuthorized = (usertype) => (req, res, next) => {
  if (req?.authedUser?.user_type === usertype) {
    next();
  } else {
    LogError('Unauthorized');
    return res.status(401).json(ResponseSchema('Unauthorized', false));
  }
};
