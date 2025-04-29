const { Un_Authenticated } = require("./ErrorCodes");

const ErrorMessages = {

    //공통
    ServerError : '서버 오류가 발생했습니다',
    RequireMent : '필수값을 입력해주세요',
    UnAuthorized : '접근 권한이 없습니다.',
    UnAuthenticated : '유효하지 않은 토큰입니다.',
    //사용자
    NotValidEmail : '이메일 주소가 올바르지 않습니다.',
    ExistEmail : '이미 존재하는 이메일 입니다.',
    NotValidPassword : '비밀번호는 6자리 이상이어야 합니다.',
    NotValidUser : '로그인 비밀번호가 일치하지 않습니다',
    NonExistEmail : '존재하지 않는 이메일 입니다',

    //코인

    NotFoundCoin : '코인을 찾을 수 없습니다',
    ExistCoinSymbol : '이미 등록된 코인 심볼입니다',
    ImpossibleCoin : '현재 거래가 불가능한 코인입니다.',
    //주문

    //거래

    //지갑
  }

module.exports = ErrorMessages;
  