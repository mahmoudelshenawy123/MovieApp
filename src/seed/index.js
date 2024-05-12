require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { logger } = require('../config/logger');
const { AddMoviesFromFile } = require('../components/Movies/MoviesService');
const DBConfig = require('../config/DBConfig');

const MovieSeedFileName = '1000GreatestFilms.csv';
const moviesSeedingFilePath = path.join(
  __dirname,
  '../documents',
  MovieSeedFileName,
);

DBConfig();

const addMoviesFromSeed = async () => {
  try {
    logger.info(
      '------------------ MOVIES SEEDING STARTED ---------------------',
    );
    const moviesSeedingFileBuffer = fs.readFileSync(moviesSeedingFilePath);
    const fileDetails = {
      buffer: moviesSeedingFileBuffer,
      originalname: MovieSeedFileName,
    };
    await AddMoviesFromFile(fileDetails, []);
    logger.info(
      '------------------ MOVIES SEEDING FINISHED SUCCESSFULLY ---------------------',
    );
  } catch (error) {
    logger.error(`ERROR IN MOVIES SEEDING: ${error.message}`);
    throw error; // Rethrow the error to propagate it
  }
};

const runSeeder = async () => {
  try {
    logger.info(
      '=================== MOVIES SEEDING STARTED ===================',
    );
    await addMoviesFromSeed();
    logger.info('=================== MOVIES SEEDING DONE ===================');
  } catch (error) {
    logger.error('ERROR IN SEEDING:', error.message);
  } finally {
    logger.info('SEEDING COMPLETE');
    process.exit(); // Exit the process after seeding is done
  }
};

runSeeder();
