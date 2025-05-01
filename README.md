
## 1.  설치

### 1.1 자격요건

다음이 로컬 PC에 설치되어 있어야 합니다:

- Node.js
- mongodb
- redis

**레디스 실행**

- mac(homebrew) 사용시
```bash
brew services start redis
```

- docker 사용시 (window 는 docker로 redis 설치 및 실행)
```bash
docker run -d -p 6379:6379 --name my-redis redis
```

**몽디비 설정**

- 매칭 엔진을 트랜잭션 처리를 했습니다. 트랜잭션 사용을 위해 몽디비 세팅을 replica set 으로 세팅해야 합니다.

```bash
mkdir -p ~/data/db-replica
```

```bash
mongod --dbpath ~/data/db-replica --replSet rs0
```
터미널 닫으면 안됩니다. ( 실행 중인 상태여야 합니다.)

새 터미널 열고 
```bash
mongosh
```

```bash
rs.initiate()
```

-> ok : 1 뜨면 Replica set 초기화 성공

### 1.2 설정

---
`.env.example` 을 `.env` 로 변경합니다.
`.env` 파일에서 환경변수는 다음과 같습니다.

```env
PORT=3000
NODE_ENV=development

MONGODB_URI=mongodb://localhost:27017/coin-exchange?replicaSet=rs0

JWT_SECRET=cilabs
JWT_EXPIRES_IN=1d

PRICE_UPDATE_INTERVAL=1000 # 가격 업데이트 주기 (밀리초) 
```

---

### 1.3 개발 서버 실행

변경 사항을 미리 보기 위해 로컬 서버를 실행할 수 있습니다. 다음 명령어들을 순차적으로 입력하세요.

```bash
npm install
```

```bash
npm run dev 
```
-> server.js , matching-engine 가 동시 실행됩니다.

### 1.4 로컬 브라우저 현황

**swagger api 명세서 현황**  
http://localhost:3000/api-docs

**실시간 이벤트 화면 현황**  
http://localhost:3000

## 2. 백엔드

### 2.1 폴더구조

```bash
coin-test
├─ constants                            ## 공통 폴더 
│  ├─ ErrorCodes.js
│  ├─ ErrorMessages.js
│  └─ Regex.js
├─ controllers                          ## 비즈니스 로직 컨트롤러
│  ├─ authController.js
│  ├─ coinController.js
│  ├─ orderController.js
│  ├─ transactionController.js
│  └─ walletController.js
├─ jest.config.js                       ## jest 루트 설정
├─ matching-engine.js                   ## 매칭 엔진 파일 ( server.js 에서 실행 )
├─ middleware                           ## 인증 미들웨어
│  └─ auth.js
├─ models                               ## 스키마 설계
│  ├─ Coin.js
│  ├─ Order.js
│  ├─ PriceHistory.js
│  ├─ Transaction.js
│  ├─ TransferLog.js
│  ├─ User.js
│  └─ Wallet.js
├─ package.json                         ## 종속성 파일 관리
├─ public                               ## 정적 파일 폴더
│  └─ index.html                        ## 실시간 이벤트 프론트 화면
├─ README.md
├─ routes                               ## 라우터
│  ├─ auth.js
│  ├─ coins.js
│  ├─ orders.js
│  ├─ transactions.js
│  └─ wallets.js
├─ server.js                            ## 진입점
├─ setup                                ## jest 셋업 폴더
│  ├─ db.js
│  ├─ jest.setup.js
│  └─ mockUser.js
├─ testserver.js                        ## jest 용 test 서버
├─ websocket                            ## 실시간 통신 웹소켓 셋업
│  └─ setup.js
└─ __tests__                            ## 단위, 통합 테스트 폴더
   ├─ auth.integration_login.test.js
   ├─ auth.integration_signup.test.js
   ├─ auth.unit.test.js
   ├─ coin.integration.test.js
   ├─ coin.unit.test.js
   ├─ order.integration.test.js
   └─ order.unit.test.js

```


## 3 테스트

### 3.1 기능 구현 현황

| 대분류             | 중분류                             | 구현 현황 | 설명                                                  |
|--------------------|------------------------------------|-----------|-------------------------------------------------------|
| 사용자 관리         | 사용자 등록 및 로그인              |  완료    |      |
| 사용자 관리         | JWT 기반 인증 시스템               |  완료    |          |
| 코인 정보 관리      | 지원 코인 목록 API                 |  완료    |                |
| 코인 정보 관리      | 코인 가격 실시간 업데이트          |   완료  |  |
| 코인 정보 관리      | 가격 변동 기록 저장                |   완료    |    |
| 지갑 기능           | 사용자별 보유량 관리               |  완료   |         |
| 지갑 기능           | 입금/출금 기능                     | 완료   |                        |
| 거래 기능           | 주문 생성 (구매/판매)             |   완료    |      |
| 거래 기능           | 주문 처리 및 체결                  |  완료   |                 |
| 거래 기능           | 거래 내역 저장 및 조회             |  완료  |                                                   |
| 실시간 데이터 제공  | 코인 가격 WebSocket 업데이트         |  완료   |                                                |
| 실시간 데이터 제공  | 주문 상태 실시간 알림             |  완료 | Redis PubSub 구독 및 채널 구성 완료                    |



### 3.2 스웨거 수동 테스트 현황

- 특이 사항 
0. 최초 사용자 등록 및 로그인을 통해 token 과 user 의 id 를 메모해 둡니다. 향후 테스트할 때 필요합니다.
1. 코인 생성은 admin 계정만 가능합니다. 이후 coinId 를 메모해 둡니다.
2. 주문 생성은 코인 생성을 하고 발급받은 coinId 를 통해 주문생성이 가능합니다.
3. 코인 생성이 되면 http://localhost:3000 에서 새로 생성한 코인의 실시간 가격이 조회 됩니다.
4. http://localhost:3000 에서 user의 id 를 입력하고 사용자 인증 버튼을 눌러야 향후 주문 상태, 거래 상태 업데이트 데이터를 응답받을 수 있습니다.
5. 신규 주문 생성 ( buy, price, amount) < -> ( sell, price, amount) 이 매칭되면 거래가 체결됩니다. 
6. 거래가 체결되면 transaction 테이블에서 거래 현황이 조회 됩니다. 이후 주문 상태가 업데이트 됩니다.
7. 이후 주문 상태 업데이트 알림과 거래 체결 알림을 http://localhost:3000 에서 확인할 수 있습니다.

| 구분         | 메서드 | 경로                              | 구현 현황 | 설명                           | 비고          |
|--------------|--------|-----------------------------------|------------|--------------------------------|---------------|
| 사용자 관리   | POST   | /api/auth/register                |  완료     | 새 사용자 등록                 | 로그인 할 때 jwt 발급 |
| 사용자 관리   | POST   | /api/auth/login                   |  완료     | 로그인 및 JWT 토큰 발급        |               |
| 코인 정보     | POST    | /api/coins                       | 완료     | 새 코인 추가 ( 관리자 )      | admin 계정만 가능   |
| 코인 정보     | GET    | /api/coins                        |  완료     | 전체 활성 코인 목록 조회       |               |
| 코인 정보     | GET    | /api/coins/:id                    |  완료     | 특정 코인 상세 정보 조회       |               |
| 코인 정보     | GET    | /api/coins/:id/history            |  완료     | 특정 코인의 가격 이력 조회     |              |
| 지갑 관리     | GET    | /api/wallets                      |  완료   | 사용자의 보유 코인 전체 조회   |              |
| 지갑 관리     | POST   | /api/wallets/deposit              |  완료   | 코인 입금 요청                 |            |
| 지갑 관리     | POST   | /api/wallets/withdraw             |  완료   | 코인 출금 요청                 |            |
| 거래 기능     | POST   | /api/orders                       |  완료     | 주문 생성 (매수/매도)         | Redis pub 사용  |
| 거래 기능     | GET    | /api/orders                       |  완료     | 사용자 주문 목록 조회          |               |
| 거래 기능     | GET    | /api/orders/:id                   |  완료     | 특정 주문 상세 조회            |               |
| 거래 기능     | DELETE | /api/orders/:id                   |  완료     | 주문 취소                      |              |
| 거래 기능     | GET    | /api/transactions                 |  완료   | 거래 내역 조회                 |               |



### 3.3 단위 및 통합 테스트



