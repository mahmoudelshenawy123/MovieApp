const { expressjwt: jwt } = require('express-jwt');

function authJwt() {
  const secret = process.env.JWT_SECRET;

  const excludedPaths = [
    '/users/add-user',
    '/users/login',
    '/admin-users/login',
  ];

  return jwt({
    secret,
    algorithms: ['HS256'],
  }).unless({
    path: excludedPaths,
  });
}

module.exports = authJwt;
