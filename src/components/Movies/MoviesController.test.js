const request = require('supertest');
const path = require('path');
const mongoose = require('mongoose');
const { app, server } = require('@/app'); // Assuming your Express app is exported from app.js
const {
  DEFAULT_ADMIN_EMAIL,
  DEFAULT_ADMIN_PASSWORD,
} = require('@src/constants/Keys');
const { LoginAdminUser } = require('../AdminUsers/AdminUsersService');

describe('Movie Endpoints', () => {
  let authToken;
  let movieDetails;

  const movieData = {
    Title: 'Test Movie',
    Director: 'Test Director',
    Year: '2024',
    Country: 'Test Country',
    Length: 200,
    Genre: 'Test Genre',
    Colour: 'red',
  };

  const updatedMovieData = {
    Title: 'Updated Test Movie',
    Director: 'Updated Test Director',
    Country: 'Updated Test Country',
    Genre: 'Updated Test Genre',
    Year: '20224',
    Length: 2020,
    Colour: 'Updated Colour',
  };

  beforeAll(async () => {
    const loggedStatus = await LoginAdminUser(
      DEFAULT_ADMIN_EMAIL,
      DEFAULT_ADMIN_PASSWORD,
    );
    authToken = loggedStatus?.data;
  });

  afterAll(async () => {
    await server.close(); // Close the server after all tests are finished
    await mongoose.disconnect(); // Close the MongoDB connection
  });

  process.on('SIGINT', async () => {
    await server.close();
    process.exit(0);
  });

  // Test for adding a movie
  it('should add a movie', async () => {
    const response = await request(app)
      .post('/movies/add-movie')
      .set('Authorization', `Bearer ${authToken}`)
      .send(movieData)
      .expect(201);

    expect(response.body.data.title).toBe(movieData.Title);
    expect(response.body.data.director).toBe(movieData.Director);
    expect(response.body.data.year).toBe(movieData.Year);
    expect(response.body.data.country).toBe(movieData.Country);
    expect(response.body.data.length).toBe(movieData.Length);
    expect(response.body.data.genre).toBe(movieData.Genre);
    expect(response.body.data.colour).toBe(movieData.Colour);
    movieDetails = response.body.data;
  });

  // Test for getting all movies
  it('should get all movies', async () => {
    const response = await request(app)
      .get('/movies/all-movies')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(response.body.data.length).toBeGreaterThan(0);
  }, 10000);

  // Test for getting all movies with pagination
  it('should get all movies with pagination', async () => {
    const response = await request(app)
      .get('/movies/all-movies-with-pagination?page=1&limit=10')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(response.body.data.data.length).toBeGreaterThan(0);
  });

  // Test for getting a movie by ID
  it('should get a movie by ID', async () => {
    const response = await request(app)
      .get(`/movies/single-movie/${movieDetails._id}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(response.body.data._id).toBe(movieDetails._id);
  });

  // Test for updating a movie
  it('should update a movie', async () => {
    const response = await request(app)
      .put(`/movies/update-movie/${movieDetails._id}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send(updatedMovieData)
      .expect(200);

    expect(response.body.data.title).toBe(updatedMovieData.Title);
    expect(response.body.data.director).toBe(updatedMovieData.Director);
    expect(response.body.data.year).toBe(updatedMovieData.Year);
    expect(response.body.data.country).toBe(updatedMovieData.Country);
    expect(response.body.data.length).toBe(updatedMovieData.Length);
    expect(response.body.data.genre).toBe(updatedMovieData.Genre);
    expect(response.body.data.colour).toBe(updatedMovieData.Colour);
  });

  // Test for deleting a movie
  it('should delete a movie', async () => {
    const response = await request(app)
      .delete(`/movies/delete-movie/${movieDetails._id}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(response.body.message).toBe('Movie Deleted Successfully');
  }, 10000);

  // Test for adding movies from file
  it('should add movies from file', async () => {
    // Assuming you have a file upload functionality and the test file 'movies_file' is properly sent in the request
    const movieFile = path.resolve(
      __dirname,
      `@src/documents/defaultMovies.csv`,
    );
    const response = await request(app)
      .post('/movies/add-movies-from-file')
      // .attach('movies_file', movieFile)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(201);

    expect(response.body.message).toBe('Movies Added Successfully');
  }, 100000);
});
