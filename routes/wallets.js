const express = require('express');
const router = express.Router();
const Wallet = require('../models/Wallet');
const authMiddleware = require('../middleware/auth');
const ErrorCodes = require('../constants/ErrorCodes');
const ErrorMessages = require('../constants/ErrorMessages');

/**
 * @swagger
 * /api/wallets:
 *   get:
 *     summary: 사용자의 모든 코인 보유량 조회
 *     description: 사용자의 모든 코인 보유 내역을 조회합니다.
 *     tags:
 *       - Wallets
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 코인 보유량 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   coinId:
 *                     type: string
 *                     description: 코인 ID
 *                   coinName:
 *                     type: string
 *                     description: 코인 이름
 *                   balance:
 *                     type: number
 *                     description: 보유량
 *       401:
 *         description: 인증 실패 (로그인 필요)
 */

router.get('/', authMiddleware, async (req, res) => {
  try {

    const user = req.user._id
    const wallets = await Wallet.findByUser(user)
    
    res.json({
      success: true,
      data: wallets
    });
  } catch (error) {
    console.error('사용자별 코인 보유량 조회 오류:', error);
    res.status(ErrorCodes.Internal).json({
      success: false,
      error: ErrorMessages.ServerError
    });
  }
});


/**
 * @swagger
 * /api/wallets/deposit:
 *   post:
 *     summary: 코인 입금
 *     description: 사용자의 지갑에 특정 코인을 입금합니다.
 *     tags:
 *       - Wallets
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
 *                 description: 입금할 코인의 ID
 *               amount:
 *                 type: number
 *                 description: 입금할 코인 수량
 *     responses:
 *       200:
 *         description: 입금 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 balance:
 *                   type: number
 *                   description: 입금 후 총 보유량
 *       400:
 *         description: 잘못된 요청 (coinId 누락 또는 amount 잘못 입력)
 *       401:
 *         description: 인증 실패 (로그인 필요)
 */


router.post('/deposit', authMiddleware, async (req, res) => {
  try {

    const { coinId, amount } = req.body

    const wallet = await Wallet.findOne({user : req.user._id, coin : coinId})

    //지갑 존재 여부 확인
    if(!wallet) {
      return res.status(ErrorCodes.Not_Found).json({
        success: false,
        error: '해당 지갑이 존재하지 않습니다.'
      });
    }

    //입금
    await wallet.deposit(amount)
      
    res.json({
      success: true,
      message: '입금이 완료되었습니다.',
      wallet : wallet
    });
  } catch (error) {
    console.error('입금 오류:', error);
    res.status(ErrorCodes.Internal).json({
      success: false,
      error: ErrorMessages.ServerError
    });
  }
});

/**
 * @swagger
 * /api/wallets/withdraw:
 *   post:
 *     summary: 코인 출금
 *     description: 사용자의 지갑에서 특정 코인을 출금합니다.
 *     tags:
 *       - Wallets
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
 *                 description: 출금할 코인의 ID
 *               amount:
 *                 type: number
 *                 description: 출금할 코인 수량
 *     responses:
 *       200:
 *         description: 출금 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 balance:
 *                   type: number
 *                   description: 출금 후 남은 보유량
 *       400:
 *         description: 잘못된 요청 (coinId 누락, amount 잘못 입력, 잔액 부족 등)
 *       401:
 *         description: 인증 실패 (로그인 필요)
 */


router.post('/withdraw', authMiddleware, async (req, res) => {
    try {
      
    const { coinId, amount } = req.body

    const wallet = await Wallet.findOne({user : req.user._id, coin : coinId})

    //지갑 존재 여부 확인
    if(!wallet) {
      return res.status(ErrorCodes.Not_Found).json({
        success: false,
        error: '해당 지갑이 존재하지 않습니다.'
      });
    }

    //출금
    await wallet.withdraw(amount)
      
    res.json({
      success: true,
      message: '출금이 완료되었습니다.',
      wallet : wallet
    });

    } catch (error) {
      console.error('출금 오류:', error);
      res.status(ErrorCodes.Internal).json({
        success: false,
        error: ErrorMessages.ServerError
      });
    }
  });

  /**
 * @swagger
 * /api/wallets/transfer:
 *   post:
 *     summary: 코인 계좌이체
 *     description: 송신자 지갑에서 수신자 지갑으로 코인을 이체합니다.
 *     tags:
 *       - Wallets
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - senderUserId
 *               - receiverUserId
 *               - coinId
 *               - amount
 *             properties:
 *               senderUserId:
 *                 type: string
 *                 description: 송신자 유저의 ID (ObjectId)
 *                 example: "662f3403d2a7180631cc32c5"
 *               receiverUserId:
 *                 type: string
 *                 description: 수신자 유저의 ID (ObjectId)
 *                 example: "662f3403d2a7180631cc32c6"
 *               coinId:
 *                 type: string
 *                 description: 이체할 코인의 ID (ObjectId)
 *                 example: "662f3403d2a7180631cc32c7"
 *               amount:
 *                 type: number
 *                 description: 이체할 코인 수량
 *                 example: 0.5
 *     responses:
 *       200:
 *         description: 이체 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: 전송 및 거래내역 기록 완료
 *                 from:
 *                   type: string
 *                   example: "662f3403d2a7180631cc32c5"
 *                 to:
 *                   type: string
 *                   example: "662f3403d2a7180631cc32c6"
 *                 amount:
 *                   type: number
 *                   example: 1
 *       400:
 *         description: 잘못된 요청 (잔액 부족, 지갑 없음 등)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: 송신자 지갑이 존재하지 않습니다
 *       401:
 *         description: 인증 실패 (로그인 필요)
 */

  router.post('/transfer', authMiddleware, async (req, res) => {
    try {
      
    const { receiverUserId, coinId, amount } = req.body
    const senderUserId = req.user._id

    const result = await Wallet.transfer({senderUserId : senderUserId, receiverUserId : receiverUserId, coinId : coinId, amount : amount })

    return res.status(ErrorCodes.Success).json({
      success: true,
      message: result.message,
      from: result.from,
      to: result.to,
      amount: result.amount
    });

    } catch (error) {
      console.error('계좌이체 오류:', error);
      res.status(ErrorCodes.Internal).json({
        success: false,
        error: ErrorMessages.ServerError
      });
    }
  });



module.exports = router; 