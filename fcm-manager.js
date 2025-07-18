// FCM 관리 클래스
class FCMManager {
  constructor() {
    this.messaging = null;
    this.isSupported = 'serviceWorker' in navigator && 'Notification' in window;
  }

  // Firebase 초기화
  async initializeFirebase() {
    if (!this.isSupported) {
      console.log('FCM is not supported in this browser');
      return false;
    }

    try {
      // Firebase 설정 (실제 프로젝트 설정으로 교체 필요)
      const firebaseConfig = {
        apiKey: "AIzaSyDLzmZyt5nZwCk98iZ6wi01y7Jxio1ppZQ",
    authDomain: "fine-bondedwarehouse.firebaseapp.com",
    databaseURL: "https://fine-bondedwarehouse-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "fine-bondedwarehouse",
    storageBucket: "fine-bondedwarehouse.appspot.com",
    messagingSenderId: "415417723331",
    appId: "1:415417723331:web:15212f190062886281b576",
    measurementId: "G-SWBR4359JQ"
      };

      // Firebase 앱 초기화
      if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
      }

      this.messaging = firebase.messaging();
      
      // Service Worker 등록 및 Firebase Messaging과 연결
      if ('serviceWorker' in navigator) {
        try {
          // 먼저 Service Worker가 이미 등록되어 있는지 확인
          const registration = await navigator.serviceWorker.getRegistration();
          if (!registration) {
            // Service Worker 등록 시도
            const newRegistration = await navigator.serviceWorker.register('./firebase-messaging-sw.js');
            console.log('Service Worker registered successfully:', newRegistration);
          } else {
            console.log('Service Worker already registered:', registration);
          }
        } catch (swError) {
          console.warn('Service Worker registration failed, continuing without it...', swError);
          // Service Worker 없이도 FCM 기본 기능 계속 진행
        }
      }

      return true;
    } catch (error) {
      console.error('Firebase initialization failed:', error);
      return false;
    }
  }

  // 알림 권한 요청
  async requestPermission() {
    try {
      const permission = await Notification.requestPermission();
      console.log('Notification permission:', permission);
      return permission === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }

  // FCM 토큰 생성
  async generateToken() {
    try {
      if (!this.messaging) {
        console.error('Firebase messaging not initialized');
        return null;
      }

      let currentToken;
      
      try {
        // VAPID 키와 함께 토큰 생성 시도
        currentToken = await this.messaging.getToken({
          vapidKey: 'BMSh553qMZrt9KYOmmcjST0BBjua_nUcA3bzMO2l5OUEF6CgMnsu-_2Nf1PqwWsjuq3XEVrXZfGFPEMtE8Kr_k'
        });
      } catch (vapidError) {
        console.warn('Token generation with VAPID failed, trying without VAPID...', vapidError);
        
        try {
          // VAPID 키 없이 토큰 생성 시도
          currentToken = await this.messaging.getToken();
        } catch (noVapidError) {
          console.warn('Token generation without VAPID also failed:', noVapidError);
          // Service Worker 없이 FCM 사용하는 경우 토큰이 없을 수 있음
          console.log('Continuing without FCM token - notifications will work in foreground only');
          return 'no-token-available';
        }
      }

      if (currentToken) {
        console.log('FCM Token:', currentToken);
        // 서버로 토큰 전송
        await this.sendTokenToServer(currentToken);
        return currentToken;
      } else {
        console.log('No registration token available.');
        return null;
      }
    } catch (error) {
      console.error('An error occurred while retrieving token:', error);
      return null;
    }
  }

  // 서버로 토큰 전송
  async sendTokenToServer(token) {
    try {
      const response = await fetch('/api/fcm/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: token })
      });

      if (response.ok) {
        console.log('Token sent to server successfully');
      } else {
        console.error('Failed to send token to server');
      }
    } catch (error) {
      console.error('Error sending token to server:', error);
    }
  }

  // 포그라운드 메시지 수신 처리
  setupForegroundMessageHandler() {
    if (!this.messaging) return;

    this.messaging.onMessage((payload) => {
      console.log('Message received in foreground:', payload);
      
      // 커스텀 알림 표시
      this.showCustomNotification(payload);
    });
  }

  // 커스텀 알림 표시
  showCustomNotification(payload) {
    const { title, body, icon } = payload.notification;
    
    // 브라우저 알림 표시
    if (Notification.permission === 'granted') {
      new Notification(title, {
        body: body,
        icon: icon || './firebase-logo.png',
        tag: 'fcm-notification'
      });
    }

    // 페이지 내 알림 표시
    this.showInPageNotification(title, body);
  }

  // 페이지 내 알림 표시
  showInPageNotification(title, body) {
    const notificationContainer = document.getElementById('notification-container');
    if (!notificationContainer) return;

    const notification = document.createElement('div');
    notification.className = 'in-page-notification';
    notification.innerHTML = `
      <div class="notification-content">
        <h4>${title}</h4>
        <p>${body}</p>
        <button onclick="this.parentElement.parentElement.remove()">닫기</button>
      </div>
    `;

    notificationContainer.appendChild(notification);

    // 5초 후 자동 제거
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove();
      }
    }, 5000);
  }

  // 토큰 갱신 감지
  setupTokenRefreshHandler() {
    if (!this.messaging) return;

    this.messaging.onTokenRefresh(() => {
      console.log('Token refreshed');
      this.generateToken();
    });
  }

  // FCM 초기화 및 설정
  async initialize() {
    const initialized = await this.initializeFirebase();
    if (!initialized) return false;

    const hasPermission = await this.requestPermission();
    if (!hasPermission) {
      console.warn('Notification permission denied, but continuing with limited functionality');
    }

    const token = await this.generateToken();
    if (token && token !== 'no-token-available') {
      console.log('FCM token generated successfully');
    } else {
      console.log('FCM token not available - foreground notifications only');
    }
    
    this.setupForegroundMessageHandler();
    this.setupTokenRefreshHandler();

    return true;
  }
}

// 전역 FCM 매니저 인스턴스
window.fcmManager = new FCMManager();
