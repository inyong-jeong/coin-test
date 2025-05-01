const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { getCoinList, getCoinDetailList, getCoinPriceHistory, createNewCoin } = require('../controllers/coinController');

/**
 * @swagger
 * /api/coins:
 *   get:
 *     summary: 코인 목록 조회 
 *     description: 모든 활성화된 코인 목록 조회합니다.
 *     tags:
 *       - Coins
 *     responses:
 *       200:
 *         description: 성공
 */
router.get('/', getCoinList); 

/**
 * @swagger
 * /api/coins/{id}:
 *   get:
 *     summary: 코인 정보 조회 
 *     description: 특정 코인 정보를 조회합니다.
 *     tags:
 *       - Coins
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: 조회할 코인의 ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 성공
 *       400:
 *         description: 잘못된 요청
 *       404:
 *         description: 코인을 찾을 수 없음
 */
router.get('/:id', getCoinDetailList);

/**
 * @swagger
 * /api/coins/{id}/history:
 *   get:
 *     summary: 특정 코인의 가격 변동 기록 조회
 *     description: 특정 코인의 가격 변동 기록을 기간(duration)별로 조회합니다.
 *     tags:
 *       - Coins
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 코인 ID
 *       - in: query
 *         name: duration
 *         required: false
 *         schema:
 *           type: string
 *           enum: [1h, 24h, 7d, 30d]
 *         description: 조회할 기간 (1시간, 24시간, 7일, 30일 중 선택)
 *     responses:
 *       200:
 *         description: 성공
 */
router.get('/:id/history', getCoinPriceHistory);

/**
 * @swagger
 * /api/coins:
 *   post:
 *     summary: 새 코인 추가 (관리자 전용)
 *     description: 새 코인을 추가합니다. (이 기능은 관리자만 사용할 수 있습니다.)
 *     tags:
 *       - Coins
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: 코인 이름
 *               symbol:
 *                 type: string
 *                 description: 코인 심볼
 *               currentPrice:
 *                 type: number
 *                 description: 현재 가격
 *     responses:
 *       201:
 *         description: 코인 추가 성공
 *       400:
 *         description: 잘못된 요청
 *       401:
 *         description: 인증 실패
 */
router.post('/', authMiddleware, createNewCoin);

module.exports = router; 