require('dotenv').config();

const config = {
  port: process.env.PORT || 8080,
  mongoUri: process.env.MONGO_URI,
  mongoDbName: process.env.MONGO_DB_NAME || 'canchas_db',
  nodeEnv: process.env.NODE_ENV || 'development',
};

module.exports = config;
