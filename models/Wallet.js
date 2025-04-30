const mongoose = require('mongoose');
const TransferLog = require('./TransferLog');

const walletSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  coin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Coin',
    required: true
  },
  balance: {
    type: Number,
    default: 0,
    min: 0
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

// 복합 인덱스 설정 (한 사용자가 같은 코인에 대해 중복 지갑을 가질 수 없음)
walletSchema.index({ user: 1, coin: 1 }, { unique: true });

// 입금 메서드
walletSchema.methods.deposit = function(amount) {
  if (amount <= 0) {
    throw new Error('입금 금액은 0보다 커야 합니다');
  }
  
  this.balance += amount;
  return this.save();
};

// 출금 메서드
walletSchema.methods.withdraw = function(amount) {
  if (amount <= 0) {
    throw new Error('출금 금액은 0보다 커야 합니다');
  }
  
  if (this.balance < amount) {
    throw new Error('잔액이 부족합니다');
  }
  
  this.balance -= amount;
  return this.save();
};

// 사용자별 모든 지갑 조회 (정적 메서드)
walletSchema.statics.findByUser = function(userId) {
  return this.find({ user: userId }).populate('coin');
};

// 입/출금 계좌이체
walletSchema.statics.transfer = async function({ senderUserId, receiverUserId, coinId, amount }) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1. 송신자 지갑
    const senderWallet = await this.findOne({ user: senderUserId, coin: coinId }).session(session);
    if (!senderWallet) throw new Error('송신자 지갑이 존재하지 않습니다');
    if (amount <= 0) throw new Error('출금 금액은 0보다 커야 합니다.');
    if (senderWallet.balance < amount) throw new Error('잔액이 부족합니다');

    // 2. 수신자 지갑
    const receiverWallet = await this.findOne({ user: receiverUserId, coin: coinId }).session(session);
    if (!receiverWallet) throw new Error('수신자 지갑이 존재하지 않습니다');
    if (amount <= 0) throw new Error('입금 금액은 0보다 커야 합니다.');

    // 3. 출금/입금
    senderWallet.balance -= amount;
    receiverWallet.balance += amount;

    await senderWallet.save({ session });
    await receiverWallet.save({ session });

    // 4. 거래 기록 추가
    await TransferLog.create([{
      sender: senderUserId,
      receiver: receiverUserId,
      coin: coinId,
      amount
    }], { session });

    // 5. 커밋
    await session.commitTransaction();
    session.endSession();

    return {
      success: true,
      message: '전송 및 거래내역 기록 완료',
      from: senderUserId,
      to: receiverUserId,
      amount
    };

  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
};

const Wallet = mongoose.model('Wallet', walletSchema);

module.exports = Wallet; 