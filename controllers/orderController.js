const Coin = require('../models/Coin');
const Order = require('../models/Order')
const ErrorCodes = require('../constants/ErrorCodes')
const ErrorMessages = require('../constants/ErrorMessages')
const Redis = require('ioredis');
const redis = new Redis(); // 기본적으로 localhost:6379에 연결


const createNewOrder = async (req, res) => {
    try {
      
      const { coin, type, amount, price } = req.body;
      const user = req.user._id.toString();
  
      // 필수 입력값 확인
      if (!coin || !type || !amount || !price) {
        return res.status(ErrorCodes.Bad_Request).json({
          success: false,
          error: ErrorMessages.RequireMent
        });
      }
      
      // 코인 존재하는지 체크
      const orderCoin = await Coin.findById(coin);
      
      if (!orderCoin) {
        return res.status(ErrorCodes.Not_Found).json({
          success: false,
          error: ErrorMessages.NotFoundCoin
        });
      }
  
      // active한 코인인지 체크
      if (!orderCoin.active) {
        return res.status(ErrorCodes.Bad_Request).json({
          success: false,
          error: ErrorMessages.ImpossibleCoin
        });
      }
      
      // 새 주문 생성
      const order = await Order.create({
        user,
        coin,
        type,
        amount,
        price
      });
  
      // 주문이 생성되면 Redis 이벤트 pub
      await redis.publish('order:new', JSON.stringify({ orderId: order._id }));
      
      res.status(ErrorCodes.Created).json({
        success: true,
        data: order
      });
  
    } catch (error) {
      console.error('주문 생성 오류:', error);
      res.status(ErrorCodes.Internal).json({
        success: false,
        error: ErrorMessages.ServerError
      });
    }
  }

  const getOrderList = async (req, res) => {
    try {
      
      const user = req.user
      const orders = await Order.findById(user._id.toString())
      
      res.json({
        success: true,
        data: orders
      });
    } catch (error) {
      console.error('주문 정보 조회 오류:', error);
      res.status(ErrorCodes.Internal).json({
        success: false,
        error: ErrorMessages.ServerError
      });
    }
  }

  const getOrderDetailList = async (req, res) => {
    try {
  
      const {id} = req.params
      const order = await Order.findById(id)
  
      //주문 상세 내역 존재 확인
  
      if (!order) {
        return res.status(ErrorCodes.Not_Found).json({
          success: false,
          error: ErrorMessages.NotFoundCoin
        });
      }
  
      res.json({
        success: true,
        data: order
      });
    } catch (error) {
      console.error('주문 상세 내역 조회 오류:', error);
      res.status(ErrorCodes.Internal).json({
        success: false,
        error: ErrorMessages.ServerError
      });
    }
  }

  const deleteCanceldOrder = async (req, res) => {
    try {
  
      const { id } = req.params;
  
      //주문 찾기
      const order = await Order.findById(id);
      if (!order) {
        return res.status(ErrorCodes.Not_Found).json({
          success: false,
          error: ErrorMessages.NotFoundOrder
        });
      }
  
      // 내 주문만 취소 가능
      if (order.user.toString() !== req.user._id.toString()) {
        return res.status(ErrorCodes.Un_Authorized).json({
          success: false,
          error: ErrorMessages.ImpossibleCancel
        });
      }
  
      // 체결되었거나 취소된건 취소 불가
      if (order.status !== 'pending') {
        return res.status(ErrorCodes.Bad_Request).json({
          success: false,
          error: '이미 체결되었거나 취소된 주문은 취소할 수 없습니다.'
        });
      }
  
      //주문 상태 변경
      order.status = 'cancelled'
      await order.save();
  
      res.status(ErrorCodes.Success).json({
        success: true,
        order : order,
        message : ErrorMessages.OrderCancel
      });
  
    } catch (error) {
      console.error('주문 취소 오류:', error);
      res.status(ErrorCodes.Internal).json({
        success: false,
        error: ErrorMessages.ServerError
      });
    }
  }

  module.exports = {
    getOrderList,
    getOrderDetailList,
    createNewOrder,
    deleteCanceldOrder
  }