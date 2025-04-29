const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

const swaggerUi = require('swagger-ui-express');
const swaggerJSDoc = require('swagger-jsdoc');


// try catch 없이 터진 코드 에러 
process.on('uncaughtException', (err) => {
  console.error(' Uncaught Exception 발생:', err);
  process.exit(1);
});

// 라우트 파일
const authRoutes = require('./routes/auth');
const coinRoutes = require('./routes/coins');
// const walletRoutes = require('./routes/wallets');
// const orderRoutes = require('./routes/orders');
// const transactionRoutes = require('./routes/transactions');

// WebSocket 핸들러
const setupWebSocket = require('./websocket/setup');

// 환경변수 설정
dotenv.config();

// Express 앱 초기화
const app = express();
const server = http.createServer(app);


// Swagger 설정
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: '가상거래소 API 명세서',
      version: '1.0.0',
      description: '인터페이스 세부사항 리스트 입니다. 로컬 port는 3000번 입니다. 로그인을 하려면 Authorize 버튼을 눌러 token 을 입력하세요.',
    },
    servers: [
      {
        url: 'http://localhost:3000',
      },
    ],
    components: { 
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    // security: [ 
    //   {
    //     bearerAuth: []
    //   }
    // ],
  },
  apis: ['./routes/*.js'],
};

// 미들웨어 설정
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));


const swaggerSpec = swaggerJSDoc(swaggerOptions);

// 3. Swagger UI 연결
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));


// API 라우트 설정
app.use('/api/auth', authRoutes);
app.use('/api/coins', coinRoutes);
// app.use('/api/wallets', walletRoutes);
// app.use('/api/orders', orderRoutes);
// app.use('/api/transactions', transactionRoutes);

// WebSocket 서버 설정
const wss = new WebSocket.Server({ server });
setupWebSocket(wss);

// 데이터베이스 연결
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// 서버 시작
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// try catch 없이 터진 비동기 코드 에러
process.on('unhandledRejection', (reason, promise) => {
  console.error(' Unhandled Promise Rejection 발생:', reason);

  server.close(() => {
    process.exit(1);
  });
});

// 전역 에러 핸들링
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    status: 'error',
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

module.exports = server; 