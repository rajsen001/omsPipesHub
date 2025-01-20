import express from 'express';
import router from './routes/index.js';
import dotenv from 'dotenv';
dotenv.config();

const app = express();

app.use(express.json());

app.use(router);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`App runnning on port ${port}...`);
});

export default app;
