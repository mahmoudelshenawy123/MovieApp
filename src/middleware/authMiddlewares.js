const { logger } = require('../config/logger');
const { ResponseSchema } = require('../helper/HelperFunctions');

exports.isAuthorized = (usertype) => (req, res, next) => {
  if (req?.authedUser?.user_type === usertype) {
    next();
  } else {
    logger.error('---------- Unauthorized -------------');
    return res.status(401).json(ResponseSchema('Unauthorized', false));
  }
};
