const {
    getCoinList,
    getCoinDetailList,
    getCoinPriceHistory,
    createNewCoin
  } = require('../controllers/coinController');
  
  const Coin = require('../models/Coin');
  const PriceHistory = require('../models/PriceHistory');
  const ErrorCodes = require('../constants/ErrorCodes');
  const ErrorMessages = require('../constants/ErrorMessages');
  
  jest.mock('../models/Coin');
  jest.mock('../models/PriceHistory');
  
  describe('coinController - Unit Test', () => {
    let req, res;
  
    beforeEach(() => {
      req = { params: {}, query: {}, body: {}, user: { role: 'admin' } };
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
    });
  
    describe('getCoinList', () => {
      it('코인 목록 조회', async () => {
        Coin.find.mockResolvedValue([{ symbol: 'BTC' }, { symbol: 'ETH' }]);
  
        await getCoinList(req, res);
  
        expect(res.json).toHaveBeenCalledWith({
          success: true,
          count: 2,
          data: [{ symbol: 'BTC' }, { symbol: 'ETH' }]
        });
      });
    });
  
    describe('getCoinDetailList', () => {
      it('코인 세부 정보 조회', async () => {
        req.params.id = '123';
        Coin.findById.mockResolvedValue({ _id: '123', symbol: 'BTC' });
  
        await getCoinDetailList(req, res);
  
        expect(res.json).toHaveBeenCalledWith({
          success: true,
          data: { _id: '123', symbol: 'BTC' }
        });
      });
  
      it('없으면 404 리턴', async () => {
        req.params.id = '123';
        Coin.findById.mockResolvedValue(null);
  
        await getCoinDetailList(req, res);
  
        expect(res.status).toHaveBeenCalledWith(ErrorCodes.Not_Found);
        expect(res.json).toHaveBeenCalledWith({
          success: false,
          error: ErrorMessages.NotFoundCoin
        });
      });
    });
  
    describe('getCoinPriceHistory', () => {
      it('특정 코인의 가격 변동 기록 조회', async () => {
        req.params.id = '123';
        req.query.duration = '1d';
        PriceHistory.getHistory.mockResolvedValue([{ price: 100 }, { price: 120 }]);
  
        await getCoinPriceHistory(req, res);
  
        expect(res.json).toHaveBeenCalledWith({
          success: true,
          count: 2,
          data: [{ price: 100 }, { price: 120 }]
        });
      });
    });
  
    describe('createNewCoin', () => {
      it('admin 계정 아니면 401 리턴', async () => {
        req.user.role = 'user';
        await createNewCoin(req, res);
  
        expect(res.status).toHaveBeenCalledWith(ErrorCodes.Un_Authorized);
        expect(res.json).toHaveBeenCalledWith({
          success: false,
          error: ErrorMessages.UnAuthorized
        });
      });
  
      it('필수값 없으면 400 리턴', async () => {
        req.body = { symbol: '', name: '', currentPrice: null };
        await createNewCoin(req, res);
  
        expect(res.status).toHaveBeenCalledWith(ErrorCodes.Bad_Request);
        expect(res.json).toHaveBeenCalledWith({
          success: false,
          error: ErrorMessages.RequireMent
        });
      });
  
      it('코인의 symbol 겹치면 400 리턴', async () => {
        req.body = { symbol: 'BTC', name: 'Bitcoin', currentPrice: 100 };
        Coin.findOne.mockResolvedValue({ symbol: 'BTC' });
  
        await createNewCoin(req, res);
  
        expect(res.status).toHaveBeenCalledWith(ErrorCodes.Bad_Request);
        expect(res.json).toHaveBeenCalledWith({
          success: false,
          error: ErrorMessages.ExistCoinSymbol
        });
      });
  
      it('새 코인 추가 201 리턴', async () => {
        req.body = { symbol: 'BTC', name: 'Bitcoin', currentPrice: 100 };
        Coin.findOne.mockResolvedValue(null);
        Coin.create.mockResolvedValue({ _id: '1', symbol: 'BTC' });
        PriceHistory.recordPrice.mockResolvedValue(true);
  
        await createNewCoin(req, res);
  
        expect(res.status).toHaveBeenCalledWith(ErrorCodes.Created);
        expect(res.json).toHaveBeenCalledWith({
          success: true,
          data: { _id: '1', symbol: 'BTC' }
        });
      });
    });
  });
  