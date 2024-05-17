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
const {
  isAuthorized,
  DecodeToken,
  CheckUserToken,
} = require('@src/middleware/AuthMiddlewares');

const upload = multer().single('movies_file');

function uploadModififed(req, res, next) {
  upload(req, res, (err) => {
    if (err) return res.status(400).json({ error: 'invalid_file' });
    return next();
  });
}

router.use(DecodeToken);

router.use(CheckUserToken);

router.get('/all-movies', isAuthorized(['admin', 'user']), getAllMovies);

router.get(
  '/all-movies-with-pagination',
  isAuthorized(['admin', 'user']),
  getAllMoviesWithPagination,
);

router.get('/single-movie/:id', isAuthorized(['admin', 'user']), getMovieById);

router.post('/add-movie', multer().none(), isAuthorized(['admin']), addMovie);

router.post(
  '/add-movies-from-file',
  uploadModififed,
  isAuthorized(['admin']),
  addMoviesFromFile,
);

router.put(
  '/update-movie/:id',
  multer().none(),
  isAuthorized(['admin']),
  updateMovie,
);

router.delete(
  '/delete-movie/:id',
  multer().none(),
  isAuthorized(['admin']),
  deleteMovie,
);

module.exports = router;
