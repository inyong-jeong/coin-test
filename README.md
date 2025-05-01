
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

## 2. 백엔드 설계

### 2.1 폴더구조

```bash
coin-test
├─ constants              
│  ├─ ErrorCodes.js
│  ├─ ErrorMessages.js
│  └─ Regex.js
├─ controllers
├─ db
│  └─ user.js
├─ matching-engine.js
├─ middleware
│  └─ auth.js
├─ models
│  ├─ Coin.js
│  ├─ Order.js
│  ├─ PriceHistory.js
│  ├─ Transaction.js
│  ├─ TransferLog.js
│  ├─ User.js
│  └─ Wallet.js
├─ package.json
├─ public
│  └─ index.html
├─ README.md
├─ routes
│  ├─ auth.js
│  ├─ coins.js
│  ├─ orders.js
│  ├─ transactions.js
│  └─ wallets.js
├─ server.js
└─ websocket
   └─ setup.js

```

### 2.2 설계현황

ERD 
인덱스 현황  
프로시저 현황  
뷰 현황  
잡/스케쥴러 현황  
트리거, 트랜잭션 현황  
백업 현황  
접근권한 현황  

### 2.3 데이터베이스 흐름 및 비즈니스 로직

