require('dotenv').config({ path: `.env.${process.env.NODE_ENV}` });
require('../config/ModuleAliases');

const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');
const { AddMoviesFromFile } = require('@src/components/Movies/MoviesService');
const DBConfig = require('@src/config/DBConfig');
const { AdminUsers } = require('@src/components/AdminUsers/AdminUsersModel');
const { LogInfo, LogError, LogWarn } = require('@src/helper/HelperFunctions');

const MovieSeedFileName = '1000GreatestFilms.csv';
const moviesSeedingFilePath = path.join(
  __dirname,
  '../documents',
  MovieSeedFileName,
);

DBConfig();

const addMoviesFromSeed = async () => {
  try {
    LogInfo(`MOVIES SEEDING STARTED`);
    const moviesSeedingFileBuffer = fs.readFileSync(moviesSeedingFilePath);
    const fileDetails = {
      buffer: moviesSeedingFileBuffer,
      originalname: MovieSeedFileName,
    };
    await AddMoviesFromFile(fileDetails, []);
    LogInfo(`MOVIES SEEDING FINISHED SUCCESSFULLY`);
  } catch (error) {
    LogError(`ERROR IN MOVIES SEEDING: ${error.message}`);
    throw error;
  }
};

const addAdminUser = async () => {
  try {
    const adminUserCheck = await AdminUsers.findOne({});

    if (!adminUserCheck) {
      await AdminUsers.create({
        email: 'admin@admin.com',
        name: 'Initial Admin',
        password: bcrypt.hashSync('123456', bcrypt.genSaltSync()),
      });
      LogInfo(`ADMIN USER ADDED`);
    } else {
      LogWarn(`ADMIN USER ALREADY ADDED`);
    }
  } catch (error) {
    LogError(`ERROR IN ADMIN USER ADDED SEEDING: ${error.message}`);
    throw error;
  }
};

const runSeeder = async () => {
  try {
    LogInfo(`ADMIN SEEDING STARTED`);
    await addAdminUser();

    LogInfo(`MOVIES SEEDING STARTED`);
    await addMoviesFromSeed();

    LogInfo(`MOVIES SEEDING DONE`);
  } catch (error) {
    LogError(`'ERROR IN SEEDING:', error.message`);
  } finally {
    LogInfo(`SEEDING COMPLETE`);
    process.exit();
  }
};

runSeeder();
