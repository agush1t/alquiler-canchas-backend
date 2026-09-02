const http = require('http');
const app = require('./app');
const config = require('./config/env');
const connectDB = require('./config/db');
const { initSocket } = require('./sockets');

async function start() {
  await connectDB();

  const httpServer = http.createServer(app);
  initSocket(httpServer);

  httpServer.listen(config.port, () => {
    console.log(`[Server] Escuchando en http://localhost:${config.port}`);
    console.log(`[Server] Vista de canchas: http://localhost:${config.port}/canchas`);
  });
}

start().catch((err) => {
  console.error('[Server] Error fatal al iniciar:', err);
  process.exit(1);
});
