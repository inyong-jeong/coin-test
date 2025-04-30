const express = require('express');
const router = express.Router();
const Coin = require('../models/Coin');
const Order = require('../models/Order')
const authMiddleware = require('../middleware/auth');
const ErrorCodes = require('../constants/ErrorCodes')
const ErrorMessages = require('../constants/ErrorMessages')
const Redis = require('ioredis');
const redis = new Redis(); // 기본적으로 localhost:6379에 연결

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
 *             required:
 *               - coin
 *               - type
 *               - amount
 *               - price
 *             properties:
 *               coin:
 *                 type: string
 *                 description: 주문할 코인의 ID (Coin._id)
 *               type:
 *                 type: string
 *                 enum: [buy, sell]
 *                 description: 주문 타입 (구매 or 판매)
 *               amount:
 *                 type: number
 *                 minimum: 0
 *                 description: 주문 수량
 *               price:
 *                 type: number
 *                 minimum: 0
 *                 description: 주문 가격
 *     responses:
 *       201:
 *         description: 주문 생성 성공
 *       400:
 *         description: 잘못된 요청
 *       401:
 *         description: 인증 실패
 */


router.post('/', authMiddleware, async (req, res) => {
  try {
    
    const { coin, type, amount, price } = req.body;
    const user = req.user._id.toString();

    // 필수 입력값 확인
    if (!coin || !type || !amount || !price) {
      return res.status(ErrorCodes.Bad_Request).json({
        success: false,
        error: ErrorMessages.RequireMent
      });
    }
    
    // 코인 존재하는지 체크
    const orderCoin = await Coin.findById(coin);
    
    if (!orderCoin) {
      return res.status(ErrorCodes.Not_Found).json({
        success: false,
        error: ErrorMessages.NotFoundCoin
      });
    }

    // active한 코인인지 체크
    if (!orderCoin.active) {
      return res.status(ErrorCodes.Bad_Request).json({
        success: false,
        error: ErrorMessages.ImpossibleCoin
      });
    }
    
    // 새 주문 생성
    const order = await Order.create({
      user,
      coin,
      type,
      amount,
      price
    });

    // 주문이 생성되면 Redis 이벤트 pub
    await redis.publish('order:new', JSON.stringify({ orderId: order._id }));
    
    res.status(ErrorCodes.Created).json({
      success: true,
      data: order
    });

  } catch (error) {
    console.error('주문 생성 오류:', error);
    res.status(ErrorCodes.Internal).json({
      success: false,
      error: ErrorMessages.ServerError
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
router.get('/', authMiddleware, async (req, res) => {
  try {
    
    const user = req.user
    const orders = await Order.findById(user._id.toString())
    
    res.json({
      success: true,
      data: orders
    });
  } catch (error) {
    console.error('주문 정보 조회 오류:', error);
    res.status(ErrorCodes.Internal).json({
      success: false,
      error: ErrorMessages.ServerError
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

router.get('/:id', authMiddleware, async (req, res) => {
  try {

    const {id} = req.params
    const order = await Order.findById(id)

    //주문 상세 내역 존재 확인

    if (!order) {
      return res.status(ErrorCodes.Not_Found).json({
        success: false,
        error: ErrorMessages.NotFoundCoin
      });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('주문 상세 내역 조회 오류:', error);
    res.status(ErrorCodes.Internal).json({
      success: false,
      error: ErrorMessages.ServerError
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

    const { id } = req.params;

    //주문 찾기
    const order = await Order.findById(id);
    if (!order) {
      return res.status(ErrorCodes.Not_Found).json({
        success: false,
        error: ErrorMessages.NotFoundOrder
      });
    }

    // 내 주문만 취소 가능
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(ErrorCodes.Un_Authorized).json({
        success: false,
        error: ErrorMessages.ImpossibleCancel
      });
    }

    // 체결되었거나 취소된건 취소 불가
    if (order.status !== 'pending') {
      return res.status(ErrorCodes.Bad_Request).json({
        success: false,
        error: '이미 체결되었거나 취소된 주문은 취소할 수 없습니다.'
      });
    }

    //주문 상태 변경
    order.status = 'cancelled'
    await order.save();

    res.status(ErrorCodes.Success).json({
      success: true,
      order : order,
      message : ErrorMessages.OrderCancel
    });

  } catch (error) {
    console.error('주문 취소 오류:', error);
    res.status(ErrorCodes.Internal).json({
      success: false,
      error: ErrorMessages.ServerError
    });
  }
});

module.exports = router; 