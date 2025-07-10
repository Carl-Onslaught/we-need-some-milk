const Settings = require('../models/Settings');

let cachedSettings = null;
let cachedAt = 0;
const CACHE_TTL_MS = 60 * 1000; // 1 minute cache

async function getSettings(forceRefresh = false) {
  const now = Date.now();
  if (!forceRefresh && cachedSettings && (now - cachedAt < CACHE_TTL_MS)) {
    return cachedSettings;
  }
  cachedSettings = await Settings.findOne({}) || await Settings.create({});
  cachedAt = now;
  return cachedSettings;
}

module.exports = {
  getSettings
};
