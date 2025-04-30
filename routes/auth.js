const express = require('express');
const router = express.Router();
const User = require('../models/User')
const ErrorCodes = require('../constants/ErrorCodes');
const ErrorMessages = require('../constants/ErrorMessages');
const EmailRegex = require('../constants/Regex');
const PasswordRegex = require('../constants/Regex');
const { getUserByEmail, createUser } = require('../db/user');

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
        return res.status(ErrorCodes.Bad_Request).send(ErrorMessages.RequireMent);
    }

    if(!email.match(EmailRegex)) {
        return res.status(ErrorCodes.Bad_Request).send(ErrorMessages.NotValidEmail);
    }

    if(!password.match(PasswordRegex)) {
        return res.status(ErrorCodes.Bad_Request).send(ErrorMessages.NotValidPassword);
    }

    const existingUser = await getUserByEmail(email);
    if(existingUser) {
        return res.status(ErrorCodes.Bad_Request).send(ErrorMessages.ExistEmail);
    }

    // const user = new User(req.body)
    const userInfo = await createUser(username, email, password, role);
    // const token = await user.generateAuthToken();

    res.json({
      success: true,
      user: userInfo,
      // token : token
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
    const user = await User.findByCredentials(req.body.email, req.body.password)
    const token = await user.generateAuthToken()
    
    res.json({
      success: true,
      user: user,
      token : token
    });
  } catch (error) {
    console.error('로그인 오류:', error);
    res.status(ErrorCodes.Internal).json({
      success: false,
      error: ErrorMessages.ServerError
    });
  }
});

module.exports = router; 