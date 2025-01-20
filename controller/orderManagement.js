import { v4 as uuidv4 } from 'uuid';
import OrderResponse from '../models/index.js';
import AppError from '../utils/appError.js';
class OrderManagement {
  constructor(config = {}) {
    this.ordersQueue = [];
    this.ordersMap = new Map();
    this.sentOrders = new Map();
    this.isTradingPeriod = false;
    this.maxOrdersPerSecond = config.maxOrdersPerSecond || 100;
    this.tradingHours = config.tradingHours || { start: '10:00', end: '21:00' };
    this.initTradingPeriodChecker();
    this.startOrderProcessor();
  }

  initTradingPeriodChecker() {
    setInterval(() => {
      const now = new Date();
      const currentTime = `${now.getHours()}:${String(
        now.getMinutes()
      ).padStart(2, '0')}`;
      if (
        currentTime >= this.tradingHours.start &&
        currentTime <= this.tradingHours.end &&
        !this.isTradingPeriod
      ) {
        this.isTradingPeriod = true;
        this.sendLogon();
      } else if (currentTime > this.tradingHours.end && this.isTradingPeriod) {
        this.isTradingPeriod = false;
        this.sendLogout();
      }
    }, 1000);
  }

  startOrderProcessor() {
    setInterval(() => {
      if (!this.isTradingPeriod) return;

      console.log('Processing orders...');
      let ordersToSend = this.ordersQueue.splice(0, this.maxOrdersPerSecond);
      for (const orderId of ordersToSend) {
        if (!this.ordersMap.has(orderId)) {
          console.log(`Order ${orderId} not found.`);
          continue;
        }

        this.send(this.ordersMap.get(orderId));
        this.sentOrders.set(orderId, Date.now());

        this.ordersMap.delete(orderId);
      }

      if (this.ordersQueue.length == 0) {
        console.log('No more orders to process.');
      } else {
        console.log('Orders remaining:', this.ordersQueue);
      }
    }, 1000);
  }

  onDataOrder(req) {
    if (!req.qty || !req.price || !req.organization) {
      console.log(`Order rejected: Missing required fields.`);
      return new AppError(
        `Missing fields, Provide all this : qty, price, organization`,
        400
      );
    }

    if (req.orderId && !req.orderType && this.ordersMap.has(req.orderId)) {
      console.log(`Order rejected: Duplicate order.`);
      return new AppError('Duplicate order', 400);
    }

    req.orderType = req.orderType || 'New';

    if (req.orderType != 'New' && req.orderId == null) {
      console.log(`Order rejected: Missing required fields.`);
      return new AppError(
        'orderId not provided for orderType other than New',
        400
      );
    } else {
      const orderId = req.orderId || uuidv4();
      req.orderId = orderId;
    }

    switch (req.orderType) {
      case 'New':
        this.ordersQueue.push(req.orderId);
        this.ordersMap.set(req.orderId, req);
        break;

      case 'Modify':
        if (!this.ordersMap.has(req.orderId)) {
          console.log(`Order ${req.orderId} not found.`);
          return new AppError('Order not found', 400);
        }
        this.ordersMap[req.orderId] = req;
        break;

      case 'Cancel':
        if (!this.ordersMap.has(req.orderId)) {
          console.log(`Order ${req.orderId} not found.`);
          return new AppError('Order not found', 400);
        }
        this.ordersMap.delete(req.orderId);
        break;

      default:
        console.log(`Order rejected: Unknown order type.`);
        return new AppError('Unknown order type', 400);
    }

    console.log(`Order ${req.orderId} queued.`, this.ordersQueue);

    return { status: 'queued', orderId: req.orderId };
  }

  async onDataResponse(response) {
    const sentTime = this.sentOrders.get(response.orderId);
    if (sentTime) {
      const latency = Date.now() - sentTime;
      console.log(
        `Order ${response.orderId} ${response.type}, Latency: ${latency}ms`
      );

      await OrderResponse.create({
        orderId: response.orderId,
        responseType: response.type,
        roundTripLatency: 3,
      });

      this.sentOrders.delete(response.orderId);

      return { status: 'success', orderId: response.orderId };
    } else {
      console.log(`Unknown response for order ${response.orderId}`);
      return new AppError('Unknown response', 400);
    }
  }

  send(order) {
    console.log(`Sending order ${order.orderId} to exchange`);
    // Simulate sending to exchange
  }

  sendLogon() {
    console.log('Sending logon to exchange');
    // Simulate sending logon
  }

  sendLogout() {
    console.log('Sending logout to exchange');
    // Simulate sending logout
  }
}

export default OrderManagement;
