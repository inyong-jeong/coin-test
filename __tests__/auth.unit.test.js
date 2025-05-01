const { signUp, login } = require('../controllers/authController');
const User = require('../models/User');
const ErrorCodes = require('../constants/ErrorCodes');
const ErrorMessages = require('../constants/ErrorMessages');

jest.mock('../models/User');

describe('authController - signUp', () => {
  let req, res;

  beforeEach(() => {
    req = { body: { username: 'test', email: 'test@example.com', password: 'test123', role: 'admin' } };
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
      json: jest.fn(),
    };
  });

  it('필수값 누락 status 400 리턴', async () => {
    req.body = {}; // 빈 요청
    await signUp(req, res);
    expect(res.status).toHaveBeenCalledWith(ErrorCodes.Bad_Request);
    expect(res.send).toHaveBeenCalledWith(ErrorMessages.RequireMent);
  });

  it('이메일 형식 유효성 400 리턴', async () => {
    req.body = {
        username: 'test',
        email: 'invalidemail',          
        password: 'test123',           
        role: 'admin'
      };
    await signUp(req, res);
    expect(res.status).toHaveBeenCalledWith(ErrorCodes.Bad_Request);
    expect(res.send).toHaveBeenCalledWith(ErrorMessages.NotValidEmail);
  });

  it('패스워드 유효성 400 리턴', async () => {
    req.body = {
        username: 'test',
        email: 'invalidemail',          
        password: '123',           
        role: 'admin'
      };
    await signUp(req, res);
    expect(res.status).toHaveBeenCalledWith(ErrorCodes.Bad_Request);
    expect(res.send).toHaveBeenCalledWith(ErrorMessages.NotValidPassword);
  });

  it('이메일 중복 체크 400 리턴', async () => {
    User.getUserByEmail.mockResolvedValue({ email: 'test@example.com' });
    await signUp(req, res);
    expect(res.status).toHaveBeenCalledWith(ErrorCodes.Bad_Request);
    expect(res.send).toHaveBeenCalledWith(ErrorMessages.ExistEmail);
  });

  it('계정 생성 성공 json 리턴', async () => {
    User.getUserByEmail.mockResolvedValue(null);
    User.createUser.mockResolvedValue({ id: 1, username: 'test' });

    await signUp(req, res);

    expect(res.json).toHaveBeenCalledWith({
      success: true,
      user: { id: 1, username: 'test' }
    });
  });
});

describe('authController - login', () => {
  let req, res;

  beforeEach(() => {
    req = { body: { email: 'test@example.com', password: 'test123' } };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  it('로그인 성공 토큰 반환', async () => {
    const mockUser = {
      email: 'test@example.com',
      generateAuthToken: jest.fn().mockResolvedValue('mocktoken'),
    };

    User.findByCredentials = jest.fn().mockResolvedValue(mockUser);

    await login(req, res);

    expect(User.findByCredentials).toHaveBeenCalledWith('test@example.com', 'test123');
    expect(mockUser.generateAuthToken).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      user: mockUser,
      token: 'mocktoken'
    });
  });

  it('should handle error and return 500', async () => {
    User.findByCredentials = jest.fn().mockRejectedValue(new Error('DB error'));
    await login(req, res);
    expect(res.status).toHaveBeenCalledWith(ErrorCodes.Internal);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: ErrorMessages.ServerError
    });
  });
});
