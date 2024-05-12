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
const { DecodeToken } = require('../../helper/HelperFunctions');

router.use(DecodeToken);

router.get('/all-admin-users', getAllAdminUsers);

router.get('/all-admin-users-with-pagination', getAllAdminUsersWithPagination);

router.get('/single-admin-user/:id', getAdminUserById);

router.post('/add-admin-user', multer().none(), addAdminUser);

router.post('/login', multer().none(), login);

router.put('/update-admin-user/:id', multer().none(), updateAdminUser);

router.delete('/delete-admin-user/:id', multer().none(), deleteAdminUser);

module.exports = router;
