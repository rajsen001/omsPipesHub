import dotenv from 'dotenv';
dotenv.config();

process.on('uncaughtException', (err) => {
  console.log('UnCaught Exception. Shutting down....');
  console.log(err.name, '. ', err.message, ' : ', err);
  process.exit(1);
});

import app from './app.js';

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`App runnning on port ${process.env.PORT}...`);
});

process.on('unhandledRejection', (err) => {
  console.log(err.name, '. ', err.message);
  console.log('Unhandled Rejection. Shutting down....');
  server.close(() => {
    process.exit(1);
  });
});

export default server;