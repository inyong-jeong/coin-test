const ErrorCodes = require('../constants/ErrorCodes');
const ErrorMessages = require('../constants/ErrorMessages');
const Transaction = require('../models/Transaction');

const getTransactionList = async (req, res) => {
    try {
  
      const user = req.user
      const transactions = await Transaction.findByUser(user._id.toString())
      
      res.json({
        success: true,
        data: transactions
      });
    } catch (error) {
      console.error('거래 체결 목록 조회 오류:', error);
      res.status(ErrorCodes.Internal).json({
        success: false,
        error: ErrorMessages.ServerError
      });
    }
  }

  module.exports = {
    getTransactionList
  }