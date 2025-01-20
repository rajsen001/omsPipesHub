import mongoose from 'mongoose';
process.on('uncaughtException', (err) => {
  console.log('UnCaught Exception. Shutting down....');
  console.log(err.name, '. ', err.message, ' : ', err);
  process.exit(1);
});

import './app.js';

mongoose
  .connect(process.env.DATABASE)
  .then((con) => {
    console.log('DB connection successful!');
  })
  .catch((err) => {
    console.log(err);
  });

process.on('unhandledRejection', (err) => {
  console.log(err.name, '. ', err.message);
  console.log('Unhandled Rejection. Shutting down....');
  server.close(() => {
    process.exit(1);
  });
});

export default server;
