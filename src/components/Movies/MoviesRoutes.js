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

const upload = multer().single('movies_file');

function uploadModififed(req, res, next) {
  upload(req, res, (err) => {
    if (err) return res.status(400).json({ error: 'invalid_file' });
    return next();
  });
}

router.get('/all-movies', getAllMovies);

router.get('/all-movies-with-pagination', getAllMoviesWithPagination);

router.get('/single-movie/:id', getMovieById);

router.post('/add-movie', multer().none(), addMovie);

router.post('/add-movies-from-file', uploadModififed, addMoviesFromFile);

router.put('/update-movie/:id', multer().none(), updateMovie);

router.delete('/delete-movie/:id', multer().none(), deleteMovie);

module.exports = router;
