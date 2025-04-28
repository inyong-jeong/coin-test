const express = require('express');
const router = express.Router();
const Coin = require('../models/Coin');
const PriceHistory = require('../models/PriceHistory');
const authMiddleware = require('../middleware/auth');
const ErrorCodes = require('../constants/ErrorCodes');
const ErrorMessages = require('../constants/ErrorMessages')
const EmailRegex = require('../constants/Regex')
const PasswordRegex = require('../constants/Regex')
const { getUserByEmail, createUser } = require('../db/user')
const jwt = require('jsonwebtoken')
/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: 새 사용자 등록
 *     description: 새 사용자를 등록합니다.
 *     tags:
 *       - Auth
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
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
 *               role:
 *                 type : string
 *                 description: 사용자 권한
 *     responses:
 *       200:
 *         description: 회원가입 성공
 *       400:
 *         description: 잘못된 요청
 */

router.post('/register', async (req, res) => {
  try {
    const {username, email, password, role} = req.body;

    if(!username || !email || !password) {
        return res.status(ErrorCodes.Bad_Request).send(ErrorMessages.RequireMent)
    }

    if(!email.match(EmailRegex)) {
        return res.status(ErrorCodes.Bad_Request).send(ErrorMessages.NotValidEmail)
    }

    if(!password.match(PasswordRegex)) {
        return res.status(ErrorCodes.Bad_Request).send(ErrorMessages.NotValidPassword)
    }

    const existingUser = await getUserByEmail(email);
    if(existingUser) {
        return res.status(ErrorCodes.Bad_Request).send(ErrorMessages.ExistEmail)
    }

    const user = await createUser(username, email, password, role);
    const token = jwt.sign({ user: { userId: user._id, email } }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
    
    res.json({
      success: true,
      user: user,
      token, token
    });
  } catch (error) {
    console.error('회원가입 오류:', error);
    res.status(ErrorCodes.Internal).json({
      success: false,
      error: ErrorMessages.ServerError
    });
  }
});


/**
 * @swagger
 * /api/auth/login:
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