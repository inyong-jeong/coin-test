const {
    createNewOrder,
    getOrderList,
    getOrderDetailList,
    deleteCanceldOrder
  } = require('../controllers/orderController');
  
  const Coin = require('../models/Coin');
  const Order = require('../models/Order');
  const Redis = require('ioredis');
  const ErrorCodes = require('../constants/ErrorCodes');
  const ErrorMessages = require('../constants/ErrorMessages');
  
  jest.mock('../models/Coin');
  jest.mock('../models/Order');
  jest.mock('ioredis');
  
  describe('orderController - Unit Test', () => {
    let req, res, redisMock;
  
    beforeEach(() => {
      req = {
        body: {},
        params: {},
        user: { _id: 'user123' }
      };
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      redisMock = {
        publish: jest.fn()
      };
      Redis.mockImplementation(() => redisMock);
    });
  
    describe('createNewOrder', () => {
      it('should return 400 if required fields are missing', async () => {
        await createNewOrder(req, res);
        expect(res.status).toHaveBeenCalledWith(ErrorCodes.Bad_Request);
        expect(res.json).toHaveBeenCalledWith({ success: false, error: ErrorMessages.RequireMent });
      });
  
      it('should return 404 if coin not found', async () => {
        req.body = { coin: 'coin1', type: 'buy', amount: 1, price: 100 };
        Coin.findById.mockResolvedValue(null);
  
        await createNewOrder(req, res);
  
        expect(res.status).toHaveBeenCalledWith(ErrorCodes.Not_Found);
        expect(res.json).toHaveBeenCalledWith({ success: false, error: ErrorMessages.NotFoundCoin });
      });
  
      it('should return 400 if coin is inactive', async () => {
        req.body = { coin: 'coin1', type: 'buy', amount: 1, price: 100 };
        Coin.findById.mockResolvedValue({ active: false });
  
        await createNewOrder(req, res);
  
        expect(res.status).toHaveBeenCalledWith(ErrorCodes.Bad_Request);
        expect(res.json).toHaveBeenCalledWith({ success: false, error: ErrorMessages.ImpossibleCoin });
      });
  
      it('should create order and publish Redis event', async () => {
        req.body = { coin: 'coin1', type: 'buy', amount: 1, price: 100 };
        Coin.findById.mockResolvedValue({ _id: 'coin1', active: true });
        Order.create.mockResolvedValue({ _id: 'order1' });
  
        await createNewOrder(req, res);
  
        expect(redisMock.publish).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(ErrorCodes.Created);
        expect(res.json).toHaveBeenCalledWith({
          success: true,
          data: { _id: 'order1' }
        });
      });
    });
  
    describe('getOrderList', () => {
      it('should return user orders', async () => {
        Order.findById.mockResolvedValue({ order: 'sample' });
        await getOrderList(req, res);
  
        expect(res.json).toHaveBeenCalledWith({ success: true, data: { order: 'sample' } });
      });
    });
  
    describe('getOrderDetailList', () => {
      it('should return order detail', async () => {
        req.params.id = 'order123';
        Order.findById.mockResolvedValue({ _id: 'order123' });
  
        await getOrderDetailList(req, res);
        expect(res.json).toHaveBeenCalledWith({ success: true, data: { _id: 'order123' } });
      });
  
      it('should return 404 if order not found', async () => {
        req.params.id = 'order123';
        Order.findById.mockResolvedValue(null);
  
        await getOrderDetailList(req, res);
        expect(res.status).toHaveBeenCalledWith(ErrorCodes.Not_Found);
        expect(res.json).toHaveBeenCalledWith({
          success: false,
          error: ErrorMessages.NotFoundCoin
        });
      });
    });
  
    describe('deleteCanceldOrder', () => {
      it('should return 404 if order not found', async () => {
        req.params.id = 'order123';
        Order.findById.mockResolvedValue(null);
  
        await deleteCanceldOrder(req, res);
        expect(res.status).toHaveBeenCalledWith(ErrorCodes.Not_Found);
        expect(res.json).toHaveBeenCalledWith({
          success: false,
          error: ErrorMessages.NotFoundOrder
        });
      });
  
      it('should return 401 if not owner', async () => {
        Order.findById.mockResolvedValue({ user: 'otherUser' });
        req.params.id = 'order123';
  
        await deleteCanceldOrder(req, res);
        expect(res.status).toHaveBeenCalledWith(ErrorCodes.Un_Authorized);
        expect(res.json).toHaveBeenCalledWith({
          success: false,
          error: ErrorMessages.ImpossibleCancel
        });
      });
  
      it('should return 400 if order already cancelled/filled', async () => {
        Order.findById.mockResolvedValue({ user: req.user._id, status: 'filled' });
        req.params.id = 'order123';
  
        await deleteCanceldOrder(req, res);
        expect(res.status).toHaveBeenCalledWith(ErrorCodes.Bad_Request);
      });
  
      it('should cancel order if all conditions pass', async () => {
        const mockOrder = {
          user: req.user._id,
          status: 'pending',
          save: jest.fn()
        };
        Order.findById.mockResolvedValue(mockOrder);
        req.params.id = 'order123';
  
        await deleteCanceldOrder(req, res);
        expect(mockOrder.status).toBe('cancelled');
        expect(mockOrder.save).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(ErrorCodes.Success);
        expect(res.json).toHaveBeenCalledWith({
          success: true,
          order: mockOrder,
          message: ErrorMessages.OrderCancel
        });
      });
    });
  });
  