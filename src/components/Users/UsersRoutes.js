const express = require('express');

const router = express.Router();
const multer = require('multer');
const {
  addUser,
  updateUser,
  deleteUser,
  getAllUsers,
  getAllUsersWithPagination,
  getUserById,
  toggleMovieInFavorite,
  getAllUserFavoritedMoviesPaginated,
} = require('./UsersController');
const { login } = require('./UsersController');
const {
  isAuthorized,
  DecodeToken,
  CheckUserToken,
} = require('@src/middleware/AuthMiddlewares');

router.use(DecodeToken);

router.use(CheckUserToken);

router.get('/all-users', isAuthorized(['admin']), getAllUsers);

router.get(
  '/all-users-with-pagination',
  isAuthorized(['admin']),
  getAllUsersWithPagination,
);

router.get('/single-user/:id', isAuthorized(['admin', 'user']), getUserById);

router.post('/add-user', multer().none(), isAuthorized(['admin']), addUser);

router.post('/login', multer().none(), login);

router.put(
  '/update-user/:id',
  multer().none(),
  isAuthorized(['admin', 'user']),
  updateUser,
);

router.delete(
  '/delete-user/:id',
  multer().none(),
  isAuthorized(['admin']),
  deleteUser,
);

router.post(
  '/toggle-movie-from-favorite',
  multer().none(),
  isAuthorized(['user']),
  toggleMovieInFavorite,
);

router.get(
  '/all-favorited-movie',
  isAuthorized(['user']),
  getAllUserFavoritedMoviesPaginated,
);

module.exports = router;
