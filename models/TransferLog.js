const mongoose = require('mongoose');


const transferLogSchema = new mongoose.Schema({
    sender: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true 
    },
    receiver: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
     },
    coin: { 
        type: mongoose.Schema.Types.ObjectId,
         ref: 'Coin',
        required: true
     },
    amount: { 
        type: Number,
        required: true,
        min: 0 
    },
    memo: { 
        type: String
     }, 
    createdAt: { 
        type: Date, 
        default: Date.now
     },
    updatedAt: {
        type: Date,
        default: Date.now
      }
  }, {
    timestamps: true
  });
  
  const TransferLog = mongoose.model('TransferLog', transferLogSchema);
  module.exports = TransferLog;
  