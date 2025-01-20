import OrderManagement from './orderManagement.js';

const orderManagement = new OrderManagement();
orderManagement.startOrderProcessor();

const handleOrderRequest = async (req, res) => {
  const result = orderManagement.onDataOrder(req.body);
  res.status(200).json(result);
};

const handleExchangeResponse = async (req, res) => {
  const result = orderManagement.onDataResponse(req.body);
  res.status(200).json(result);
};

export { handleOrderRequest, handleExchangeResponse };
