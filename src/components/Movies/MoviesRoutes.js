const express = require('express');

const router = express.Router();
const multer = require('multer');
const {
  addMovie,
  getAllMovies,
  getAllMoviesWithPagination,
  deleteMovie,
  updateMovie,
  getMovieById,
} = require('./MoviesController');
const { addMoviesFromFile } = require('./MoviesController');
const { isAuthorized } = require('../../middleware/authMiddlewares');
const { DecodeToken } = require('../../helper/HelperFunctions');

const upload = multer().single('movies_file');

function uploadModififed(req, res, next) {
  upload(req, res, (err) => {
    if (err) return res.status(400).json({ error: 'invalid_file' });
    return next();
  });
}

router.use(DecodeToken);

router.get('/all-movies', getAllMovies);

router.get('/all-movies-with-pagination', getAllMoviesWithPagination);

router.get('/single-movie/:id', getMovieById);

router.post('/add-movie', multer().none(), isAuthorized('admin'), addMovie);

router.post(
  '/add-movies-from-file',
  uploadModififed,
  isAuthorized('admin'),
  addMoviesFromFile,
);

router.put(
  '/update-movie/:id',
  multer().none(),
  isAuthorized('admin'),
  updateMovie,
);

router.delete(
  '/delete-movie/:id',
  multer().none(),
  isAuthorized('admin'),
  deleteMovie,
);

module.exports = router;
