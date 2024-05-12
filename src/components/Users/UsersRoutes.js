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
} = require('./UsersController');

router.get('/all-users', getAllUsers);

router.get('/all-users-with-pagination', getAllUsersWithPagination);

router.get('/single-user/:id', getUserById);

router.post('/add-user', multer().none(), addUser);

router.put('/update-user/:id', multer().none(), updateUser);

router.delete('/delete-user/:id', multer().none(), deleteUser);

module.exports = router;
