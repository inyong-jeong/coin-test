const request = require('supertest');
const app = require('../testserver'); 
const mongoose = require('mongoose');

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

describe('Coin API Integration', () => {
  let createdCoinId = null;

  it('새로운 코인을 생성해야 합니다. (admin only)', async () => {
    const res = await request(app)
      .post('/api/coins')
      .set('Authorization', 'Bearer <admin_token_here>')
      .send({
        symbol: 'INT',
        name: 'IntegrationCoin',
        currentPrice: 500
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    createdCoinId = res.body.data._id;
  });

  it('코인 리스트를 가져옵니다.', async () => {
    const res = await request(app).get('/api/coins');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.count).toBeGreaterThan(0);
  });

  it('코인 상세 조회합니다.', async () => {
    const res = await request(app).get(`/api/coins/${createdCoinId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('가격 변동 기록 조회합니다.', async () => {
    const res = await request(app).get(`/api/coins/${createdCoinId}/history?duration=1d`);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
