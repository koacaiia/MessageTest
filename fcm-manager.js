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
        apiKey: "your-api-key",
        authDomain: "your-project.firebaseapp.com",
        projectId: "your-project-id",
        storageBucket: "your-project.appspot.com",
        messagingSenderId: "your-sender-id",
        appId: "your-app-id"
      };

      // Firebase 앱 초기화
      if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
      }

      this.messaging = firebase.messaging();
      
      // Service Worker 등록
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.register('./firebase-messaging-sw.js');
        console.log('Service Worker registered successfully:', registration);
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

      const currentToken = await this.messaging.getToken({
        vapidKey: 'your-vapid-key' // Firebase 콘솔에서 생성한 VAPID 키
      });

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
    if (!hasPermission) return false;

    await this.generateToken();
    this.setupForegroundMessageHandler();
    this.setupTokenRefreshHandler();

    return true;
  }
}

// 전역 FCM 매니저 인스턴스
window.fcmManager = new FCMManager();
