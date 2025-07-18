# 🔥 FCM Test Application

Firebase Cloud Messaging을 지원하는 Progressive Web App 테스트 애플리케이션입니다.

## ✨ 주요 기능

- 🔔 **Firebase Cloud Messaging (FCM)**: 실시간 푸시 알림
- 📱 **Progressive Web App (PWA)**: 모바일 앱과 같은 경험
- 🔧 **Service Worker**: 백그라운드 알림 처리
- 🎨 **현대적인 UI**: 반응형 디자인과 아름다운 인터페이스
- 🧪 **알림 테스트**: 실시간 알림 테스트 기능

## 🚀 빠른 시작

### 1. 프로젝트 클론

```bash
git clone https://github.com/yourusername/fcm-test-app.git
cd fcm-test-app
```

### 2. 의존성 설치

```bash
npm install
```

### 3. Firebase 프로젝트 설정

1. [Firebase Console](https://console.firebase.google.com/)에서 새 프로젝트 생성
2. 프로젝트 설정에서 웹 앱 추가
3. Firebase 설정 정보 복사
4. `fcm-manager.js`와 `firebase-messaging-sw.js`의 설정 업데이트

```javascript
const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};
```

### 4. VAPID 키 설정

1. Firebase Console > 프로젝트 설정 > Cloud Messaging
2. 웹 푸시 인증서에서 키 쌍 생성
3. VAPID 키를 `fcm-manager.js`에 추가

```javascript
const currentToken = await this.messaging.getToken({
  vapidKey: 'your-actual-vapid-key'
});
```

### 5. 로컬 서버 실행

```bash
npm start
```

브라우저에서 `http://localhost:8080`에 접속

## 📦 배포

### GitHub Pages 배포

```bash
npm run deploy:github
```

### Firebase Hosting 배포

```bash
npm run deploy
```

## 🔧 GitHub Actions 자동 배포

프로젝트는 GitHub Actions를 통한 자동 배포를 지원합니다.

### 설정 방법

1. **GitHub Pages 활성화**:
   - Repository Settings > Pages
   - Source: GitHub Actions 선택

2. **Firebase 배포 (선택사항)**:
   - Firebase CLI로 로그인: `firebase login:ci`
   - 생성된 토큰을 GitHub Repository Secrets에 `FIREBASE_TOKEN`으로 추가

### 배포 트리거

- `main` 또는 `master` 브랜치에 푸시
- Pull Request 생성 (테스트만 실행)
- 수동 워크플로우 실행

## 🧪 테스트 방법

1. **FCM 초기화**: "FCM 초기화" 버튼 클릭
2. **알림 권한**: "알림 권한 요청" 버튼 클릭하여 브라우저 알림 허용
3. **토큰 생성**: "토큰 생성" 버튼으로 FCM 토큰 생성
4. **테스트 알림**: "테스트 알림" 버튼으로 로컬 알림 테스트
5. **커스텀 알림**: 하단 폼에서 제목과 내용을 입력하여 커스텀 알림 전송

## 📱 PWA 설치

1. 브라우저에서 애플리케이션 접속
2. 주소창 옆의 "설치" 버튼 클릭
3. 홈 화면에 앱 아이콘 추가

## 🔔 서버에서 알림 전송

### Node.js 예제

```javascript
const admin = require('firebase-admin');

// Firebase Admin SDK 초기화
const serviceAccount = require('./path/to/serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// 알림 전송
const message = {
  notification: {
    title: '새로운 메시지',
    body: '안녕하세요! 새로운 알림입니다.'
  },
  token: 'user-fcm-token-here'
};

admin.messaging().send(message)
  .then((response) => {
    console.log('Successfully sent message:', response);
  })
  .catch((error) => {
    console.log('Error sending message:', error);
  });
```

### cURL 예제

```bash
curl -X POST https://fcm.googleapis.com/fcm/send \
  -H "Authorization: key=YOUR_SERVER_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "user-fcm-token-here",
    "notification": {
      "title": "테스트 알림",
      "body": "서버에서 전송된 알림입니다.",
      "icon": "/firebase-logo.png"
    }
  }'
```

## 📂 프로젝트 구조

```
fcm-test-app/
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions 워크플로우
├── index.html                  # 메인 HTML 파일
├── fcm-manager.js             # FCM 관리 클래스
├── firebase-messaging-sw.js   # Service Worker
├── manifest.json              # PWA 매니페스트
├── firebase.json              # Firebase 설정
├── package.json               # Node.js 패키지 설정
└── README.md                  # 프로젝트 문서
```

## 🛠️ 기술 스택

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Firebase**: Cloud Messaging, Hosting
- **PWA**: Service Workers, Web App Manifest
- **CI/CD**: GitHub Actions
- **Deployment**: GitHub Pages, Firebase Hosting

## 🔒 보안 고려사항

- Firebase 설정 정보는 환경변수로 관리 권장
- VAPID 키는 안전하게 보관
- 서버 키는 절대 클라이언트 코드에 포함하지 않음
- HTTPS 환경에서만 Service Worker 동작

## 🐛 문제 해결

### Service Worker 등록 실패
- HTTPS 환경인지 확인
- 브라우저 개발자 도구에서 Service Worker 상태 확인

### 알림이 표시되지 않음
- 브라우저 알림 권한 확인
- Firebase 설정 정보 검증
- 네트워크 연결 상태 확인

### 토큰 생성 실패
- Firebase 프로젝트 설정 확인
- VAPID 키 유효성 검증
- 브라우저 콘솔 에러 메시지 확인

## 📄 라이선스

MIT License

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 지원

문제가 있거나 질문이 있으시면 [Issues](https://github.com/yourusername/fcm-test-app/issues)에 등록해 주세요.

---

⭐ 이 프로젝트가 도움이 되셨다면 Star를 눌러주세요!
