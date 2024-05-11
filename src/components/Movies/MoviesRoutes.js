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

router.get('/all-movies', getAllMovies);

router.get('/all-movies-with-pagination', getAllMoviesWithPagination);

router.get('/single-movie/:id', getMovieById);

router.post('/add-movie', multer().none(), addMovie);

router.put('/update-movie/:id', multer().none(), updateMovie);

router.delete('/delete-movie/:id', multer().none(), deleteMovie);

module.exports = router;
