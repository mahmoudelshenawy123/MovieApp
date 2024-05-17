const request = require('supertest');
const mongoose = require('mongoose');
const { app, server } = require('@/app'); // Assuming your Express app is exported from app.js
const {
  DEFAULT_ADMIN_EMAIL,
  DEFAULT_ADMIN_PASSWORD,
} = require('@src/constants/Keys');
const { LoginAdminUser } = require('../AdminUsers/AdminUsersService');
const { GetMovieForTest } = require('../Movies/MoviesService');

describe('User Endpoints', () => {
  let authToken;
  let userToken;
  let movieDetails;
  const addedUserData = {
    name: 'Test User',
    email: 'testuser@testuser.com',
    password: '12345testuser',
  };
  const updatedUserData = {
    name: 'Updated Test User',
    email: 'updatedtestuser@updatedtestuser.com',
    password: '12343updatedtestuser',
  };
  let userData;

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

  // Test for adding a user
  it('should add a user', async () => {
    const response = await request(app)
      .post('/users/add-user')
      .set('Authorization', `Bearer ${authToken}`)
      .send(addedUserData)
      .expect(201);

    const addedUser = response.body.data;
    userData = response.body.data;
    expect(addedUser).toBeDefined();
    expect(addedUser.name).toBe(addedUserData.name);
    expect(addedUser.email).toBe(addedUserData.email);
    expect(addedUser.password).not.toBe(addedUserData.password); // Password should be hashed
  });

  // Test for logging in a user
  it('should login a user after create user', async () => {
    const loginData = {
      email: addedUserData?.email,
      password: addedUserData?.password,
    };
    const response = await request(app)
      .post('/users/login')
      .send(loginData)
      .expect(201);

    const loginToken = response.body.data.token;
    userToken = loginToken;

    expect(loginToken).toBeDefined();
  });

  // Test for updating a user
  it('should update a user', async () => {
    // Assuming you have addedUserData's ID stored somewhere accessible
    const userId = userData?._id; // Replace with actual user ID
    const response = await request(app)
      .put(`/users/update-user/${userId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send(updatedUserData)
      .expect(201);

    const updatedUser = response.body.data;

    expect(updatedUser).toBeDefined();
    expect(updatedUser.name).toBe(updatedUserData.name);
    expect(updatedUser.email).toBe(updatedUserData.email);
    expect(updatedUser.password).not.toBe(updatedUserData.password);
  });

  // Test for logging in a user
  it('should login a user after update user', async () => {
    const loginData = {
      email: updatedUserData?.email,
      password: updatedUserData?.password,
    };
    const response = await request(app)
      .post('/users/login')
      .send(loginData)
      .expect(201);

    const loginToken = response.body.data.token;
    userToken = loginToken;

    expect(loginToken).toBeDefined();
  });

  // Test for getting a user by ID
  it('should get a user by ID', async () => {
    // Assuming you have addedUserData's ID stored somewhere accessible
    const userId = userData?._id; // Replace with actual user ID
    const response = await request(app)
      .get(`/users/single-user/${userId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);

    const fetchedUser = response.body.data;

    expect(fetchedUser._id).toBe(userId);
  });

  // Test for getting all users
  it('should get all users', async () => {
    const response = await request(app)
      .get('/users/all-users')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    const allUsers = response.body.data;

    expect(allUsers.length).toBeGreaterThan(0);
  });

  // // Test for adding a movie in user favorites
  it('should adding a movie in user favorites', async () => {
    // Assuming you have addedUserData's ID stored somewhere accessible
    movieDetails = await GetMovieForTest();
    const movieId = movieDetails?._id;
    const response = await request(app)
      .post('/users/toggle-movie-from-favorite')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ favoriteMovieId: movieId })
      .expect(201);

    const toggleResponse = response.body;

    expect(toggleResponse.status).toBe(true);
    // You can add more assertions based on your response structure
  });

  // Test for getting the added movie to favorited movies with pagination
  it('should get the added movie to favorited movies with pagination', async () => {
    // Assuming you have addedUserData's ID stored somewhere accessible
    const response = await request(app)
      .get('/users/all-favorited-movie')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);

    const favoritedMovies = response.body.data.data;
    expect(String(favoritedMovies?.[0]._id)).toBe(String(movieDetails?._id));
  });

  // // Test for removing a movie in user favorites
  it('should removing a movie in user favorites', async () => {
    // Assuming you have addedUserData's ID stored somewhere accessible
    movieDetails = await GetMovieForTest();
    const movieId = movieDetails?._id;
    const response = await request(app)
      .post('/users/toggle-movie-from-favorite')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ favoriteMovieId: movieId })
      .expect(201);

    const toggleResponse = response.body;

    expect(toggleResponse.status).toBe(true);
  });

  // Test for getting the removed movie to favorited movies with pagination
  it('should get the removed movie to favorited movies with pagination', async () => {
    // Assuming you have addedUserData's ID stored somewhere accessible
    const response = await request(app)
      .get('/users/all-favorited-movie')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);

    const favoritedMovies = response.body.data.data;
    expect(String(favoritedMovies?.[0]?._id)).not.toBe(
      String(movieDetails?._id),
    );
  });

  // Test for deleting a user
  it('should delete a user', async () => {
    // Assuming you have addedUserData's ID stored somewhere accessible
    const userId = userData?._id; // Replace with actual user ID
    const response = await request(app)
      .delete(`/users/delete-user/${userId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(201);

    const deletedMessage = response.body;

    expect(deletedMessage.status).toBe(true);
    expect(deletedMessage.message).toBe('User Deleted Successfully');
  });
});
