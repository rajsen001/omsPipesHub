import request from 'supertest';
import app from '../app.js';
import mongoose from 'mongoose';
import OrderResponse from '../models/index.js';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer;

beforeAll(async () => {
  mongoServer = new MongoMemoryServer();
  await mongoServer.start();

  const mongoUri = await mongoServer.getUri();

  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.connection.close();
  await mongoServer.stop();
});

describe('OMS API', () => {
  describe('GET /', () => {
    it('should return 200 OK', async () => {
      const res = await request(app).get('/');
      expect(res.status).toBe(200);
    });
  });

  describe('/POST order', () => {
    it('should get the send order', async () => {
      const res = await request(app).post('/order').send({
        qty: '34',
        price: '700',
        organization: 'mrf',
        action: 'buy',
      });
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('status', 'queued');
      expect(res.body).toHaveProperty('orderId');
    });
  });

  describe('/POST orderResponse', () => {
    it('should accept the orderResponse', async () => {
      const mockOrderResponse = new OrderResponse({
        orderId: '123',
        responseType: 'sold',
        roundTripLatency: 3, // Just to make sure it's not undefined, becoz it will be calculated in the controller
      });

      await mockOrderResponse.save();

      await request(app).post('/orderResponse').send({
        orderId: '123',
        type: 'sold',
      });
    });
  });
});
