
module.exports = {
    testEnvironment: 'node',                         // 환경 설정 (브라우저 or 노드)
    setupFilesAfterEnv: ['<rootDir>/setup/jest.setup.js'], // 테스트 전 실행할 스크립트
    testMatch: ['**/__tests__/**/*.test.js'],        // 테스트 파일 패턴
    coverageDirectory: 'coverage',                   // 커버리지 폴더
  };
  