const express = require('express');
const moviesRouter = require('@src/components/Movies/MoviesRoutes');
const UsersRouter = require('@src/components/Users/UsersRoutes');
const AdminUsersRouter = require('@src/components/AdminUsers/AdminUsersRoutes');

const router = express.Router();

router.use('/movies', moviesRouter);
router.use('/users', UsersRouter);
router.use('/admin-users', AdminUsersRouter);

module.exports = router;
