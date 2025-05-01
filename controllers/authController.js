const User = require('../models/User')
const ErrorCodes = require('../constants/ErrorCodes');
const ErrorMessages = require('../constants/ErrorMessages');
const EmailRegex = require('../constants/Regex');
const PasswordRegex = require('../constants/Regex');


const signUp = async (req, res) => {
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
  
      const existingUser = await User.getUserByEmail(email);
      if(existingUser) {
          return res.status(ErrorCodes.Bad_Request).send(ErrorMessages.ExistEmail);
      }
  
      const userInfo = await User.createUser(username, email, password, role);
  
      res.json({
        success: true,
        user: userInfo,
      });
    } catch (error) {
      console.error('회원가입 오류:', error);
      res.status(ErrorCodes.Internal).json({
        success: false,
        error: ErrorMessages.ServerError
      });
    }
  }

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

  const login = async (req, res) => {
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
  }

  module.exports = {
    signUp,
    login,
  }
  