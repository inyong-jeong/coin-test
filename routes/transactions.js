const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { getTransactionList } = require('../controllers/transactionController');

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


router.get('/', authMiddleware, getTransactionList);

module.exports = router; 