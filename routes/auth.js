const express = require('express');
const router = express.Router();
const { signUp, login } = require('../controllers/authController');

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

router.post('/register', signUp);

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

router.post('/login', login);

module.exports = router; 