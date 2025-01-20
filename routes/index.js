import express from 'express';
import kafkaService from '../kafka/index.js';
import OrderManagement from '../controller/orderManagement.js';

const router = express.Router();

router.get('/', (req, res) => {


  res.status(200).json({
    status: 'success',
    message: 'Hello World!',
  });
});

export default router;
