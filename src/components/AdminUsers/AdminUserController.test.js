const request = require('supertest');
const mongoose = require('mongoose');
const { app, server } = require('@/app'); // Assuming your Express app is exported from app.js
const { LoginAdminUser } = require('./AdminUsersService');
const {
  DEFAULT_ADMIN_EMAIL,
  DEFAULT_ADMIN_PASSWORD,
} = require('@src/constants/Keys');

describe('Admin User Endpoints', () => {
  let addedUserId;
  let authToken;
  const addedUserData = {
    name: 'Test User22',
    email: 'testdas34112daddsas321122@exameqwple.com',
    password: 'te3123das12s12dstpaseqwsword2',
  };
  const updatedUserData = {
    name: 'Updated Test User',
    email: 'updated3das12_tedasdasdasadsst@example.com',
    password: 'te3123das12s12dstpaseqwsword2',
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

  // Test for adding an admin user
  it('should add an admin user', async () => {
    const response = await request(app)
      .post('/admin-users/add-admin-user')
      .set('Authorization', `Bearer ${authToken}`)
      .send(addedUserData)
      .expect(201);

    // Assuming your response body contains the added user's data
    addedUserId = response.body.data._id;
    const addedUser = response.body.data;
    // Validate that the user was added to the database
    expect(addedUser).toBeDefined();
    expect(addedUser.name).toBe(addedUserData.name);
    expect(addedUser.email).toBe(addedUserData.email);
    expect(addedUser.password).not.toBe(addedUserData.password); // Password should be hashed
  });

  // Test for updating an admin user
  it('should update an admin user', async () => {
    const response = await request(app)
      .put(`/admin-users/update-admin-user/${addedUserId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send(updatedUserData)
      .expect(201);

    // Assuming your response body contains the updated user's data
    const updatedUser = response.body.data;
    // Validate that the user was updated in the database
    expect(updatedUser).toBeDefined();
    expect(updatedUser.name).toBe(updatedUser.name);
    expect(updatedUser.email).toBe(updatedUserData.email);
    expect(updatedUser.password).not.toBe(updatedUserData.password);
    addedUserData.email = updatedUser.email;
    addedUserData.name = updatedUser.name;
    addedUserData.password = updatedUserData.password;
  });

  // Test for getting an admin user by ID
  it('should get an admin user by ID', async () => {
    const response = await request(app)
      .get(`/admin-users/single-admin-user/${addedUserId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    // Assuming your response body contains the fetched user's data
    const fetchedUser = response.body.data;

    // Validate that the fetched user matches the added user
    expect(fetchedUser._id).toBe(addedUserId);
  });

  // Test for getting all admin users
  it('should get all admin users', async () => {
    const response = await request(app)
      .get('/admin-users/all-admin-users')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    // Assuming your response body contains an array of admin users
    const allAdminUsers = response.body.data;

    // Validate the response contains at least one user
    expect(allAdminUsers.length).toBeGreaterThan(0);
  });

  // Test for getting all admin users with pagination
  it('should get all admin users with pagination', async () => {
    const response = await request(app)
      .get('/admin-users/all-admin-users-with-pagination')
      .set('Authorization', `Bearer ${authToken}`)
      .query({ page: 1, limit: 10 })
      .expect(200);

    // Assuming your response body contains paginated admin users
    const paginatedAdminUsers = response.body.data.data;

    // Validate the response contains paginated users
    expect(paginatedAdminUsers?.length || 0).toBeGreaterThan(0);
  });

  // Test for logging in an admin user
  it('should login an admin user', async () => {
    const loginData = {
      email: addedUserData?.email,
      password: addedUserData?.password,
    };
    const response = await request(app)
      .post('/admin-users/login')
      .send(loginData)
      .expect(201);

    // Assuming your response body contains a login token
    const loginToken = response.body.data.token;

    // Validate the response contains a login token
    expect(loginToken).toBeDefined();
  });

  // Test for deleting an admin user
  it('should delete an admin user', async () => {
    const response = await request(app)
      .delete(`/admin-users/delete-admin-user/${addedUserId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(201);

    // Assuming your response body contains a success message
    const deletedMessage = response.body;
    // Validate that the user was deleted from the database
    expect(deletedMessage.status).toBe(true);
    expect(deletedMessage.message).toBe('Admin User Deleted Successfully');
  });

  // Close MongoDB connection after all tests are finished
  afterAll(async () => {
    await mongoose.disconnect();
  });
});
