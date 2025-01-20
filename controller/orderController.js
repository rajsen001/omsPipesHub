import OrderManagement from './orderManagement.js';
import catchAsync from '../utils/catchAsync.js';
const orderManagement = new OrderManagement();
orderManagement.startOrderProcessor();

const handleOrderRequest = (req, res) => {
  const result = orderManagement.onDataOrder(req.body);

  if (result instanceof Error) {
    res.status(400).json({
      status: 'error',
      message: result.message,
    });
  } else {
    res.status(200).json(result);
  }
};

const handleExchangeResponse = catchAsync(async (req, res) => {
  const result = await orderManagement.onDataResponse(req.body);

  if (result instanceof Error) {
    res.status(400).json({
      status: 'error',
      message: result.message,
    });
  } else {
    res.status(201).json(result);
  }
});

export { handleOrderRequest, handleExchangeResponse };
