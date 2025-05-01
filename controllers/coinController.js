const Coin = require('../models/Coin');
const PriceHistory = require('../models/PriceHistory');
const ErrorCodes = require('../constants/ErrorCodes')
const ErrorMessages = require('../constants/ErrorMessages')


const getCoinList = async (req, res) => {
    try {
      const coins = await Coin.find({ active: true });
      
      res.json({
        success: true,
        count: coins.length,
        data: coins
      });
    } catch (error) {
      console.error('코인 목록 조회 오류:', error);
      res.status(ErrorCodes.Internal).json({
        success: false,
        error: ErrorMessages.ServerError
      });
    }
  }

const getCoinDetailList = async (req, res) => {
    try {
      const coin = await Coin.findById(req.params.id);
      
      //코인 존재 확인
      
      if (!coin) {
        return res.status(ErrorCodes.Not_Found).json({
          success: false,
          error: ErrorMessages.NotFoundCoin
        });
      }
      
      res.json({
        success: true,
        data: coin
      });
    } catch (error) {
      console.error('코인 정보 조회 오류:', error);
      res.status(ErrorCodes.Internal).json({
        success: false,
        error: ErrorMessages.ServerError
      });
    }
  }

  const getCoinPriceHistory = async (req, res) => {
    try {
      const { duration } = req.query;
      const priceHistory = await PriceHistory.getHistory(req.params.id, duration);
      
      res.json({
        success: true,
        count: priceHistory.length,
        data: priceHistory
      });
    } catch (error) {
      console.error('코인 가격 내역 조회 오류:', error);
      res.status(ErrorCodes.Internal).json({
        success: false,
        error: ErrorMessages.ServerError
      });
    }
  }

  const createNewCoin = async (req, res) => {
    try {
      // 관리자 확인
      if (req.user.role !== 'admin') {
        return res.status(ErrorCodes.Un_Authorized).json({
          success: false,
          error: ErrorMessages.UnAuthorized
        });
      }
      
      const { symbol, name, currentPrice } = req.body;
      
      // 필수 입력값 확인
      if (!symbol || !name || !currentPrice) {
        return res.status(ErrorCodes.Bad_Request).json({
          success: false,
          error: ErrorMessages.RequireMent
        });
      }
      
      // 코인 중복 확인
      const existingCoin = await Coin.findOne({ symbol });
      if (existingCoin) {
        return res.status(ErrorCodes.Bad_Request).json({
          success: false,
          error: ErrorMessages.ExistCoinSymbol
        });
      }
      
      // 새 코인 생성
      const coin = await Coin.create({
        symbol,
        name,
        currentPrice,
        active: true
      });
      
      // 초기 가격 내역 생성
      await PriceHistory.recordPrice(coin._id, currentPrice);
      
      res.status(ErrorCodes.Created).json({
        success: true,
        data: coin
      });
    } catch (error) {
      console.error('코인 생성 오류:', error);
      res.status(ErrorCodes.Internal).json({
        success: false,
        error: ErrorMessages.ServerError
      });
    }
  }

  module.exports = {
    getCoinList,
    getCoinDetailList,
    getCoinPriceHistory,
    createNewCoin
  }