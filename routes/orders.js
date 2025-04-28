const express = require('express');
const router = express.Router();
const Coin = require('../models/Coin');
const PriceHistory = require('../models/PriceHistory');
const authMiddleware = require('../middleware/auth');

/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: 새 주문 생성
 *     description: 사용자가 새 주문을 생성합니다.
 *     tags:
 *       - Orders
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               coinId:
 *                 type: string
 *                 description: 주문할 코인의 ID
 *               orderType:
 *                 type: string
 *                 enum: [buy, sell]
 *                 description: 주문 타입 (구매 또는 판매)
 *               amount:
 *                 type: number
 *                 description: 주문 수량
 *               price:
 *                 type: number
 *                 description: 주문 가격
 *     responses:
 *       201:
 *         description: 주문 생성 성공
 *       400:
 *         description: 잘못된 요청
 *       401:
 *         description: 인증 실패
 */

router.post('/', async (req, res) => {
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

/**
 * @swagger
 * /api/orders:
 *   get:
 *     summary: 사용자의 주문 내역 조회
 *     description: 사용자의 모든 주문 내역을 조회합니다.
 *     tags:
 *       - Orders
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 주문 내역 조회 성공
 *       401:
 *         description: 인증 실패
 */
router.get('/', async (req, res) => {
  try {
    const coin = await Coin.findById(req.params.id);
    
    if (!coin) {
      return res.status(404).json({
        success: false,
        error: '코인을 찾을 수 없습니다'
      });
    }
    
    res.json({
      success: true,
      data: coin
    });
  } catch (error) {
    console.error('코인 정보 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: '서버 오류가 발생했습니다'
    });
  }
});

/**
 * @swagger
 * /api/orders/{id}:
 *   get:
 *     summary: 특정 주문 상세 조회
 *     description: 특정 주문의 상세 정보를 조회합니다.
 *     tags:
 *       - Orders
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 주문 ID
 *     responses:
 *       200:
 *         description: 주문 상세 조회 성공
 *       404:
 *         description: 주문을 찾을 수 없음
 *       401:
 *         description: 인증 실패
 */

router.get('/:id', async (req, res) => {
  try {
    const { duration } = req.query;
    const priceHistory = await PriceHistory.getHistory(req.params.id, duration);
    
    res.json({
      success: true,
      count: priceHistory.length,
      data: priceHistory
    });
  } catch (error) {
    console.error('코인 가격 내역 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: '서버 오류가 발생했습니다'
    });
  }
});

/**
 * @swagger
 * /api/orders/{id}:
 *   delete:
 *     summary: 미체결 주문 취소
 *     description: 사용자가 미체결된 주문을 취소합니다.
 *     tags:
 *       - Orders
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 주문 ID
 *     responses:
 *       200:
 *         description: 주문 취소 성공
 *       400:
 *         description: 취소할 수 없는 주문
 *       404:
 *         description: 주문을 찾을 수 없음
 *       401:
 *         description: 인증 실패
 */

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    // 관리자 확인
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: '접근 권한이 없습니다'
      });
    }
    
    const { symbol, name, currentPrice } = req.body;
    
    // 필수 입력값 확인
    if (!symbol || !name || !currentPrice) {
      return res.status(400).json({
        success: false,
        error: '모든 필드를 입력해 주세요'
      });
    }
    
    // 코인 중복 확인
    const existingCoin = await Coin.findOne({ symbol });
    if (existingCoin) {
      return res.status(400).json({
        success: false,
        error: '이미 등록된 코인 심볼입니다'
      });
    }
    
    // 새 코인 생성
    const coin = await Coin.create({
      symbol,
      name,
      currentPrice,
      active: true
    });
    
    // 초기 가격 내역 생성
    await PriceHistory.recordPrice(coin._id, currentPrice);
    
    res.status(201).json({
      success: true,
      data: coin
    });
  } catch (error) {
    console.error('코인 생성 오류:', error);
    res.status(500).json({
      success: false,
      error: '서버 오류가 발생했습니다'
    });
  }
});

module.exports = router; 