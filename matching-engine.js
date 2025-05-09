const Redis = require('ioredis');
const Order = require('./models/Order');
const Transaction = require('./models/Transaction');
const { sendTransactionNotification, sendOrderUpdate } = require('./websocket/setup');

function startMatchingEngine(){

const subscriber = new Redis();

// Redis 구독
subscriber.subscribe('order:new', (err, count) => {
    if (err) console.error('Redis 구독 실패:', err);
    else console.log(` order:new 채널 구독 시작 (${count}개 채널)`);
  });
  
  //새 주문 이벤트 수신
  subscriber.on('message', async (channel, message) => {
      if (channel !== 'order:new') return;
    
      const { orderId } = JSON.parse(message);
      console.log(`새 주문 이벤트 수신: ${orderId}`);
    
      const newOrder = await Order.findById(orderId).populate('coin').populate('user');
  
      console.log('newOrder', newOrder)
      if (!newOrder || ['filled', 'cancelled'].includes(newOrder.status)) return;
    
      const oppositeType = newOrder.type === 'buy' ? 'sell' : 'buy';
    
      console.log('oppositeType', oppositeType)
  
  
      // 트랜잭션 시작
      const session = await Order.startSession();
      session.startTransaction();
    
      try {
  
          // 신규 주문의 수량이 체결된 갯수보다 커야함
        while (newOrder.amount > newOrder.filled) {
          const matchedOrder = await Order.findOne({
            coin: newOrder.coin._id,
            type: oppositeType,
            price: newOrder.price,
            status: { $in: ['pending', 'partially_filled'] },
            $expr: { $lt: ["$filled", "$amount"] }
          }).populate('user').session(session);
    
          console.log('matchedOrder ::', matchedOrder)
          if (!matchedOrder) break;
    
          const newRemaining = newOrder.amount - newOrder.filled;
          const matchedRemaining = matchedOrder.amount - matchedOrder.filled;
          const matchAmount = Math.min(newRemaining, matchedRemaining);
    
          // 체결된 거래 추가
          const transaction = await Transaction.create([{
            buyer: newOrder.type === 'buy' ? newOrder.user._id : matchedOrder.user._id,
            seller: newOrder.type === 'sell' ? newOrder.user._id : matchedOrder.user._id,
            coin: newOrder.coin._id,
            price: newOrder.price,
            amount: matchAmount,
            buyOrder: newOrder.type === 'buy' ? newOrder._id : matchedOrder._id,
            sellOrder: newOrder.type === 'sell' ? newOrder._id : matchedOrder._id,
          }], { session });

          console.log(' 거래 체결 : ', transaction)
  
          // 체결된 이후 주문 업데이트
          await newOrder.updateOrder(matchAmount, session);
          await matchedOrder.updateOrder(matchAmount, session);
  
          console.log('업데이트 완료 :: ')

          // 특정 사용자에게 주문 상태 업데이트 전송
          sendOrderUpdate(newOrder.user._id.toString(), {
            _id: newOrder._id,
              filled: newOrder.filled,
              status: newOrder.status,
              amount: newOrder.amount,
              type: newOrder.type,
              price: newOrder.price,
            });
            
          sendOrderUpdate(matchedOrder.user._id.toString(), {
              _id: matchedOrder._id,
              filled: matchedOrder.filled,
              status: matchedOrder.status,
              amount: matchedOrder.amount,
              type: matchedOrder.type,
              price: matchedOrder.price,
            });
  
          // 새 거래 알림 전송
          sendTransactionNotification(transaction[0].buyer.toString(), transaction[0].seller.toString(), transaction[0]);
        }

        console.log(' 거래 완료 :: ')
    
        await session.commitTransaction();
        session.endSession();
      } catch (err) {
        await session.abortTransaction();
        session.endSession();
        console.error('거래 트랜잭션 실패:', err);
      }
    });
}

module.exports = { startMatchingEngine };