const request = require('supertest');
const app = require('../testserver');
const mongoose = require('mongoose');

let createdOrderId;
let testCoinId;

beforeAll(async () => {
  await mongoose.connect(process.env.TEST_DB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('Order API Integration', () => {
  it('should create a test coin first', async () => {
    const res = await request(app)
      .post('/api/coins')
      .send({ symbol: 'ORD', name: 'OrderCoin', currentPrice: 100 });
    
    testCoinId = res.body.data._id;
  });

  it('should create new order', async () => {

    console.log('testCoinId', testCoinId)
    const res = await request(app)
      .post('/api/orders')
      .send({
        coin: testCoinId,
        type: 'buy',
        amount: 2,
        price: 200
      });

    expect(res.statusCode).toBe(201);
    createdOrderId = res.body.data._id;
  });

  it('should get order detail', async () => {
    const res = await request(app).get(`/api/orders/${createdOrderId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should cancel the order', async () => {
    const res = await request(app).delete(`/api/orders/${createdOrderId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
