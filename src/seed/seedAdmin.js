require('dotenv').config({ path: `.env.${process.env.NODE_ENV}` });
require('../config/ModuleAliases');

const bcrypt = require('bcrypt');
const DBConfig = require('@src/config/DBConfig');
const { AdminUsers } = require('@src/components/AdminUsers/AdminUsersModel');
const { LogInfo, LogError, LogWarn } = require('@src/helper/HelperFunctions');
const {
  DEFAULT_ADMIN_EMAIL,
  DEFAULT_ADMIN_NAME,
  DEFAULT_ADMIN_PASSWORD,
} = require('@src/constants/Keys');

DBConfig();

const addAdminUser = async () => {
  try {
    const adminUserCheck = await AdminUsers.findOne({});

    if (!adminUserCheck) {
      await AdminUsers.create({
        email: DEFAULT_ADMIN_EMAIL,
        name: DEFAULT_ADMIN_NAME,
        password: bcrypt.hashSync(DEFAULT_ADMIN_PASSWORD, bcrypt.genSaltSync()),
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
    LogInfo(`ADMIN SEEDING DONE`);
  } catch (error) {
    LogError(`'ERROR IN SEEDING:', error.message`);
  } finally {
    LogInfo(`SEEDING COMPLETE`);
    process.exit();
  }
};

runSeeder();
