const express = require('express');
const router = express.Router();
const Coin = require('../models/Coin');
const PriceHistory = require('../models/PriceHistory');
const authMiddleware = require('../middleware/auth');

/**
 * @swagger
 * /api/register:
 *   post:
 *     summary: 새 사용자 등록
 *     description: 새 사용자를 등록합니다.
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: 사용자 이름
 *               email:
 *                 type: string
 *                 format: email
 *                 description: 사용자 이메일
 *               password:
 *                 type: string
 *                 description: 사용자 비밀번호
 *     responses:
 *       201:
 *         description: 회원가입 성공
 *       400:
 *         description: 잘못된 요청
 */

router.post('/register', async (req, res) => {
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
 * /api/login:
 *   post:
 *     summary: 로그인 및 JWT 발급
 *     description: 사용자가 로그인하고 JWT 토큰을 발급받습니다.
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: 사용자 이메일
 *               password:
 *                 type: string
 *                 description: 사용자 비밀번호
 *     responses:
 *       200:
 *         description: 로그인 성공 (JWT 토큰 반환)
 *       400:
 *         description: 잘못된 요청
 *       401:
 *         description: 인증 실패
 */

router.post('/login', async (req, res) => {
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