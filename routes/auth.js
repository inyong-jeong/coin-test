const express = require('express');
const router = express.Router();
const Coin = require('../models/Coin');
const PriceHistory = require('../models/PriceHistory');
const authMiddleware = require('../middleware/auth');

/**
 * @route   POST /api/register
 * @desc    새 사용자 등록
 * @access  Public
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
 * @route   POST /api/login
 * @desc    로그인 및 JWT 발급
 * @access  Public
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