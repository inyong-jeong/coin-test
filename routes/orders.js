const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { createNewOrder, getOrderList, getOrderDetailList, deleteCanceldOrder } = require('../controllers/orderController');

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


router.post('/', authMiddleware, createNewOrder); 

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
router.get('/', authMiddleware, getOrderList);

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

router.get('/:id', authMiddleware, getOrderDetailList);

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

router.delete('/:id', authMiddleware, deleteCanceldOrder);

module.exports = router; 