const express = require('express');
const router = express.Router();
const Coin = require('../models/Coin');
const Wallet = require('../models/Wallet')
const authMiddleware = require('../middleware/auth');
const ErrorCodes = require('../constants/ErrorCodes')
const ErrorMessages = require('../constants/ErrorMessages')
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


router.post('/deposit', async (req, res) => {
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


router.post('/withdraw', async (req, res) => {
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

module.exports = router; 