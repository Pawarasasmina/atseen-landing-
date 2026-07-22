import 'dotenv/config';
import app from './app.js';
import { connectDatabase, disconnectDatabase } from './config/db.js';

const PORT = process.env.PORT || 5000;
let server;
connectDatabase().then(() => {
  server = app.listen(PORT, () => console.log(`API listening on port ${PORT}`));
}).catch((error) => { console.error(`Database connection failed: ${error.message}`); process.exit(1); });

async function shutdown(signal) {
  console.log(`${signal} received. Shutting down.`);
  if (server) server.close();
  await disconnectDatabase();
  process.exit(0);
}
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
export default app;
