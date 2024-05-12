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
const { DecodeToken } = require('../../helper/HelperFunctions');
const { isAuthorized } = require('../../middleware/authMiddlewares');

router.use(DecodeToken);

router.get('/all-users', isAuthorized('admin'), getAllUsers);

router.get(
  '/all-users-with-pagination',
  isAuthorized('admin'),
  getAllUsersWithPagination,
);

router.get('/single-user/:id', getUserById);

router.post('/add-user', multer().none(), addUser);

router.post('/login', multer().none(), login);

router.put('/update-user/:id', multer().none(), updateUser);

router.delete(
  '/delete-user/:id',
  multer().none(),
  isAuthorized('admin'),
  deleteUser,
);

router.post(
  '/toggle-movie-from-favorite',
  multer().none(),
  toggleMovieInFavorite,
);

router.get('/all-favorited-movie', getAllUserFavoritedMoviesPaginated);

module.exports = router;
