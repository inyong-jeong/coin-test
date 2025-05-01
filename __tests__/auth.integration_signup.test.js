
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

describe('POST /api/auth/register', () => {
  it('새로운 사용자가 생성되어야 합니다.', async () => {
    const res = await request(app).post('/api/auth/register').send({
      username: 'test',
      email: 'test@example.com',
      password: 'test123',
      role: 'admin'
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

