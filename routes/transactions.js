const express = require('express');
const router = express.Router();
const Coin = require('../models/Coin');
const PriceHistory = require('../models/PriceHistory');
const authMiddleware = require('../middleware/auth');

/**
 * @swagger
 * /api/transactions:
 *   get:
 *     summary: 사용자의 거래 내역 조회
 *     description: 로그인한 사용자의 모든 체결된 거래 내역을 조회합니다.
 *     tags:
 *       - Transactions
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 거래 내역 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   transactionId:
 *                     type: string
 *                     description: 거래 ID
 *                   coinId:
 *                     type: string
 *                     description: 거래된 코인 ID
 *                   orderType:
 *                     type: string
 *                     enum: [buy, sell]
 *                     description: 거래 타입 (구매 또는 판매)
 *                   amount:
 *                     type: number
 *                     description: 거래된 수량
 *                   price:
 *                     type: number
 *                     description: 거래된 가격
 *                   timestamp:
 *                     type: string
 *                     format: date-time
 *                     description: 거래 완료 시간
 *       401:
 *         description: 인증 실패 (로그인 필요)
 */


router.get('/transactions', async (req, res) => {
  try {
    const coins = await Coin.find({ active: true });
    
    res.json({
      success: true,
      count: coins.length,
      data: coins
    });
  } catch (error) {
    console.error('코인 목록 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: '서버 오류가 발생했습니다'
    });
  }
});

module.exports = router; 