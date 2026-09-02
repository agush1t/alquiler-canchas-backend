const mongoose = require('mongoose');
const config = require('./env');

async function connectDB() {
  if (!config.mongoUri) {
    throw new Error(
      'MONGO_URI no está definida. Configurá tu archivo .env a partir de .env.example'
    );
  }

  try {
    await mongoose.connect(config.mongoUri, {
      dbName: config.mongoDbName,
    });
    console.log(`[DB] Conectado a MongoDB Atlas (db: ${config.mongoDbName})`);
  } catch (error) {
    console.error('[DB] Error al conectar a MongoDB:', error.message);
    process.exit(1);
  }
}

module.exports = connectDB;
