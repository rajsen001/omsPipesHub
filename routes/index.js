import express from 'express';
import {
  handleOrderRequest,
  handleExchangeResponse,
} from '../controller/orderController.js';

const router = express.Router();

router.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Hello World!',
  });
});

router.post('/order', handleOrderRequest);
router.post('/orderResponse', handleExchangeResponse);
export default router;
