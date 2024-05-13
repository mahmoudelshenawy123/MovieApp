const NodeCache = require('node-cache');
const { logger } = require('../config/logger');

const myCache = new NodeCache();

function setInCache(key, value, ttl = 0) {
  myCache.set(key, JSON.stringify(value), ttl);
  logger.info(`Cached data with key '${key}'`);
}

function getFromCache(key) {
  const cachedData = myCache.get(key);
  if (cachedData) {
    logger.info(`Retrieved data from cache with key '${key}'`);
  } else {
    logger.info(`Cache miss for key '${key}'`);
  }
  return cachedData ? JSON.parse(cachedData) : cachedData;
}

function removeFromCache(key) {
  myCache.del(key);
  logger.info(`Removed data from cache with key '${key}'`);
}

module.exports = {
  setInCache,
  getFromCache,
  removeFromCache,
};
