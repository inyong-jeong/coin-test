const Wallet = require('../models/Wallet');
const ErrorCodes = require('../constants/ErrorCodes');
const ErrorMessages = require('../constants/ErrorMessages');

const getWalletList = async (req, res) => {
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
  }

const depositWallet = async (req, res) => {
    try {
  
      const { coinId, amount } = req.body
  
      const wallet = await Wallet.findOne({user : req.user._id, coin : coinId})
  
      //지갑 존재 여부 확인
      if(!wallet) {
        return res.status(ErrorCodes.Not_Found).json({
          success: false,
          error: '해당 지갑이 존재하지 않습니다.'
        });
      }
  
      //입금
      await wallet.deposit(amount)
        
      res.json({
        success: true,
        message: '입금이 완료되었습니다.',
        wallet : wallet
      });
    } catch (error) {
      console.error('입금 오류:', error);
      res.status(ErrorCodes.Internal).json({
        success: false,
        error: ErrorMessages.ServerError
      });
    }
  }

const withdrawWallet = async (req, res) => {
    try {
      
    const { coinId, amount } = req.body

    const wallet = await Wallet.findOne({user : req.user._id, coin : coinId})

    //지갑 존재 여부 확인
    if(!wallet) {
      return res.status(ErrorCodes.Not_Found).json({
        success: false,
        error: '해당 지갑이 존재하지 않습니다.'
      });
    }

    //출금
    await wallet.withdraw(amount)
      
    res.json({
      success: true,
      message: '출금이 완료되었습니다.',
      wallet : wallet
    });

    } catch (error) {
      console.error('출금 오류:', error);
      res.status(ErrorCodes.Internal).json({
        success: false,
        error: ErrorMessages.ServerError
      });
    }
  }

  const transferWallet = async (req, res) => {
    try {
      
    const { receiverUserId, coinId, amount } = req.body
    const senderUserId = req.user._id

    const result = await Wallet.transfer({senderUserId : senderUserId, receiverUserId : receiverUserId, coinId : coinId, amount : amount })

    return res.status(ErrorCodes.Success).json({
      success: true,
      message: result.message,
      from: result.from,
      to: result.to,
      amount: result.amount
    });

    } catch (error) {
      console.error('계좌이체 오류:', error);
      res.status(ErrorCodes.Internal).json({
        success: false,
        error: ErrorMessages.ServerError
      });
    }
  }

  module.exports = {
    getWalletList,
    depositWallet,
    withdrawWallet,
    transferWallet
  }