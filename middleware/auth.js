const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ErrorCodes = require('../constants/ErrorCodes')
const ErrorMessages = require('../constants/ErrorMessages')

/**
 * 사용자 인증 미들웨어
 * JWT 토큰을 검증하고 인증된 사용자의 정보를 요청 객체에 추가
 */
module.exports = async function(req, res, next) {
  try {
    // 토큰 확인
    const authHeader  = req.header('Authorization');
    
    // 토큰이 없는 경우
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(ErrorCodes.Un_Authenticated).json({
        success: false,
        error: ErrorMessages.UnAuthenticated
      });
    }
    
    //Bearer 제거
    const token = authHeader.split(' ')[1];

    // 토큰 검증
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 사용자 확인
    const user = await User.findById(decoded._id);

    if (!user) {
      return res.status(ErrorCodes.Un_Authenticated).json({
        success: false,
        error: ErrorMessages.UnAuthenticated
      });
    }
    
    // 요청 객체에 사용자 정보 추가
    req.user = user;
    next();
  } catch (error) {
    // 토큰 검증 실패
    console.error('토큰 인증 오류:', error);
    res.status(401).json({
      success: false,
      error: '인증에 실패했습니다. 다시 로그인해주세요.'
    });
  }
}; 