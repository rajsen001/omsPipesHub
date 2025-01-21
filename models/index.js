import { response } from 'express';
import mongoose from 'mongoose';

const orderResponseSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
  },

  responseType: {
    type: String,
    required: true,
  },

  roundTripLatency: {
    type: Number,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const OrderResponse = mongoose.model('OrderResponse', orderResponseSchema);

export default OrderResponse;
