const NodeCache = require('node-cache');
const { LogInfo } = require('@src/helper/HelperFunctions');

const myCache = new NodeCache();

const setInCache = (key, value, ttl = 0) => {
  myCache.set(key, JSON.stringify(value), ttl);
  LogInfo(`Cached data with key '${key}'`);
};

const getFromCache = (key) => {
  const cachedData = myCache.get(key);
  if (cachedData) {
    LogInfo(`Retrieved data from cache with key '${key}'`);
  } else {
    LogInfo(`Cache miss for key '${key}'`);
  }
  return cachedData ? JSON.parse(cachedData) : cachedData;
};

const removeFromCache = (key) => {
  myCache.del(key);
  LogInfo(`Removed data from cache with key '${key}'`);
};

module.exports = {
  setInCache,
  getFromCache,
  removeFromCache,
};
