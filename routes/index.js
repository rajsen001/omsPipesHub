import express from 'express';
import kafkaService from '../kafka/index.js';

const router = express.Router();

router.get('/', (req, res) => {

  kafkaService.createProducer();

  res.status(200).json({
    status: 'success',
    message: 'Hello World!',
  });
});

export default router;
