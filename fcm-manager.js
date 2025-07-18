// FCM 관리 클래스
class FCMManager {
  constructor() {
    this.messaging = null;
    this.isSupported = 'serviceWorker' in navigator && 'Notification' in window;
    this.currentToken = null;
  }

  // Firebase 초기화
  async initializeFirebase() {
    if (!this.isSupported) {
      console.log('FCM is not supported in this browser');
      return false;
    }

    try {
      // Firebase 설정
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
      console.log('FCM initialized successfully');

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

      // 간단한 토큰 생성 (시뮬레이션)
      this.currentToken = 'fine2-token-' + Date.now();
      console.log('Token generated:', this.currentToken);
      return this.currentToken;
    } catch (error) {
      console.error('Token generation error:', error);
      return null;
    }
  }

  // Topic 구독 (시뮬레이션)
  async subscribeToTopic(token, topic) {
    try {
      console.log(`Subscribing to topic: ${topic} with token: ${token}`);
      localStorage.setItem(`topic_${topic}`, 'subscribed');
      localStorage.setItem(`topic_${topic}_token`, token);
      console.log(`Successfully subscribed to topic: ${topic}`);
      return true;
    } catch (error) {
      console.error('Topic subscription error:', error);
      return false;
    }
  }

  // Topic 구독 해제 (시뮬레이션)
  async unsubscribeFromTopic(token, topic) {
    try {
      console.log(`Unsubscribing from topic: ${topic} with token: ${token}`);
      localStorage.removeItem(`topic_${topic}`);
      localStorage.removeItem(`topic_${topic}_token`);
      console.log(`Successfully unsubscribed from topic: ${topic}`);
      return true;
    } catch (error) {
      console.error('Topic unsubscription error:', error);
      return false;
    }
  }

  // Topic 구독 상태 확인
  isSubscribedToTopic(topic) {
    return localStorage.getItem(`topic_${topic}`) === 'subscribed';
  }

  // Topic 알림 전송 (개선된 버전)
  async sendTopicNotification(topic, title, body) {
    try {
      console.log(`Attempting to send notification to topic: ${topic}`);
      
      // 구독 확인
      const isSubscribed = this.isSubscribedToTopic(topic);
      console.log(`Subscription status for ${topic}:`, isSubscribed);
      
      if (!isSubscribed) {
        console.log(`Not subscribed to topic: ${topic}. Auto-subscribing...`);
        // 자동 구독 시도
        await this.subscribeToTopic(this.currentToken || 'auto-token', topic);
      }
      
      // 알림 데이터 생성
      const payload = {
        notification: {
          title: title,
          body: `${body} (from topic: ${topic})`,
          icon: './firebase-logo.png',
          tag: `topic-${topic}-${Date.now()}`
        },
        data: {
          topic: topic,
          timestamp: new Date().toISOString(),
          messageId: 'msg-' + Date.now()
        }
      };
      
      // 즉시 알림 표시
      this.showCustomNotification(payload);
      
      // 상태 저장
      const notificationHistory = JSON.parse(localStorage.getItem('notification_history') || '[]');
      notificationHistory.push({
        topic: topic,
        title: title,
        body: body,
        timestamp: new Date().toISOString(),
        status: 'sent'
      });
      localStorage.setItem('notification_history', JSON.stringify(notificationHistory));
      
      console.log(`Topic notification sent successfully: ${title}`);
      return true;
      
    } catch (error) {
      console.error('Topic notification error:', error);
      return false;
    }
  }

  // 포그라운드 메시지 수신 처리
  setupForegroundMessageHandler() {
    if (!this.messaging) return;

    try {
      this.messaging.onMessage((payload) => {
        console.log('Message received in foreground:', payload);
        this.showCustomNotification(payload);
      });
    } catch (error) {
      console.warn('Foreground message handler setup failed:', error);
    }
  }

  // 커스텀 알림 표시
  showCustomNotification(payload) {
    const { title, body, icon, tag } = payload.notification;
    const topic = payload.data?.topic;
    
    // 브라우저 알림 표시
    if (Notification.permission === 'granted') {
      const notification = new Notification(title, {
        body: body,
        icon: icon || './firebase-logo.png',
        tag: tag || 'fcm-notification',
        requireInteraction: true
      });
      
      // 클릭 이벤트 처리
      notification.onclick = function() {
        window.focus();
        notification.close();
      };
      
      // 5초 후 자동 닫기
      setTimeout(() => {
        notification.close();
      }, 5000);
    }

    // 페이지 내 알림 표시
    this.showInPageNotification(title, body, topic);
  }

  // 페이지 내 알림 표시 (개선된 버전)
  showInPageNotification(title, body, topic = null) {
    const notificationContainer = document.getElementById('notification-container');
    if (!notificationContainer) {
      console.warn('Notification container not found');
      return;
    }

    const topicInfo = topic ? `<small style="color: #FFD700;">Topic: ${topic}</small><br>` : '';
    const timestamp = new Date().toLocaleTimeString();
    
    const notification = document.createElement('div');
    notification.className = 'in-page-notification';
    notification.style.cssText = `
      background: linear-gradient(135deg, #4CAF50, #45a049);
      color: white;
      padding: 15px;
      border-radius: 10px;
      margin-bottom: 10px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      animation: slideIn 0.3s ease;
      border-left: 4px solid #FFD700;
    `;
    
    notification.innerHTML = `
      <div class="notification-content">
        <h4 style="margin: 0 0 5px 0; font-size: 16px;">${title}</h4>
        ${topicInfo}
        <p style="margin: 0 0 10px 0; font-size: 14px;">${body}</p>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <small style="color: #E8F5E8;">${timestamp}</small>
          <button onclick="this.closest('.in-page-notification').remove()" 
                  style="background: rgba(255,255,255,0.2); border: 1px solid white; 
                         padding: 5px 10px; font-size: 12px; border-radius: 5px; 
                         color: white; cursor: pointer;">닫기</button>
        </div>
      </div>
    `;

    notificationContainer.appendChild(notification);

    // 10초 후 자동 제거
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove();
      }
    }, 10000);
  }

  // 토큰 갱신 감지
  setupTokenRefreshHandler() {
    if (!this.messaging) return;

    try {
      this.messaging.onTokenRefresh(() => {
        console.log('Token refreshed');
        this.generateToken();
      });
    } catch (error) {
      console.warn('Token refresh handler setup failed:', error);
    }
  }

  // 알림 히스토리 조회
  getNotificationHistory() {
    return JSON.parse(localStorage.getItem('notification_history') || '[]');
  }

  // 알림 히스토리 초기화
  clearNotificationHistory() {
    localStorage.removeItem('notification_history');
  }

  // FCM 초기화 및 설정
  async initialize() {
    console.log('Initializing FCM Manager...');
    
    const initialized = await this.initializeFirebase();
    if (!initialized) {
      console.error('Firebase initialization failed');
      return false;
    }

    const hasPermission = await this.requestPermission();
    if (!hasPermission) {
      console.warn('Notification permission denied, but continuing with limited functionality');
    }

    const token = await this.generateToken();
    if (token) {
      console.log('FCM token generated successfully:', token);
      // fine2 topic 자동 구독
      await this.subscribeToTopic(token, 'fine2');
    }
    
    this.setupForegroundMessageHandler();
    this.setupTokenRefreshHandler();

    console.log('FCM Manager initialized successfully');
    return true;
  }
}

// 전역 FCM 매니저 인스턴스
window.fcmManager = new FCMManager();
