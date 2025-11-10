const dotenv = require('dotenv');

dotenv.config();

module.exports = {
  PORT: process.env.PORT || 5000,
  // PORT: process.env.PORT || 3600,
  ATLAS_DB_URL: process.env.ATLAS_DB_URL,
  NODE_ENV: process.env.NODE_ENV || 'development',
  ES_URL: process.env.ES_URL,
  SECRET_KEY: process.env.SECRET_KEY,
};
