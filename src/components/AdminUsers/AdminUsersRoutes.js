const express = require('express');

const router = express.Router();
const multer = require('multer');
const {
  addAdminUser,
  updateAdminUser,
  getAdminUserById,
  getAllAdminUsersWithPagination,
  getAllAdminUsers,
  deleteAdminUser,
} = require('./AdminUsersController');
const { login } = require('./AdminUsersController');
const {
  isAuthorized,
  DecodeToken,
  CheckUserToken,
} = require('@src/middleware/AuthMiddlewares');

router.use(DecodeToken);

router.use(CheckUserToken);

router.get('/all-admin-users', isAuthorized(['admin']), getAllAdminUsers);

router.get(
  '/all-admin-users-with-pagination',
  isAuthorized(['admin']),
  getAllAdminUsersWithPagination,
);

router.get('/single-admin-user/:id', isAuthorized(['admin']), getAdminUserById);

router.post(
  '/add-admin-user',
  multer().none(),
  isAuthorized(['admin']),
  addAdminUser,
);

router.post('/login', multer().none(), login);

router.put(
  '/update-admin-user/:id',
  multer().none(),
  isAuthorized(['admin']),
  updateAdminUser,
);

router.delete(
  '/delete-admin-user/:id',
  multer().none(),
  isAuthorized(['admin']),
  deleteAdminUser,
);

module.exports = router;
