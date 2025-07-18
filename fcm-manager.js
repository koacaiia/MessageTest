// FCM 관리 클래스 - v2.1 (크로스 브라우저 지원)
class FCMManager {
  constructor() {
    this.messaging = null;
    this.isSupported = this.checkBrowserSupport();
    this.currentToken = null;
    this.version = '2.1';
    this.browserInfo = this.getBrowserInfo();
  }

  // 브라우저 지원 상태 확인
  checkBrowserSupport() {
    const checks = {
      serviceWorker: 'serviceWorker' in navigator,
      notification: 'Notification' in window,
      pushManager: 'PushManager' in window,
      localStorage: typeof Storage !== 'undefined'
    };
    
    console.log('Browser support check:', checks);
    
    // 기본 요구사항: localStorage와 Notification
    return checks.localStorage && checks.notification;
  }

  // 브라우저 정보 수집
  getBrowserInfo() {
    const userAgent = navigator.userAgent;
    const browserInfo = {
      userAgent: userAgent,
      isChrome: /Chrome/.test(userAgent) && /Google Inc/.test(navigator.vendor),
      isFirefox: /Firefox/.test(userAgent),
      isSafari: /Safari/.test(userAgent) && !/Chrome/.test(userAgent),
      isEdge: /Edg/.test(userAgent),
      isOpera: /OPR/.test(userAgent),
      isMobile: /Mobile|Android|iPhone|iPad/.test(userAgent)
    };
    
    console.log('Browser info:', browserInfo);
    return browserInfo;
  }

  // Firebase 초기화
  async initializeFirebase() {
    if (!this.isSupported) {
      console.log('FCM is not supported in this browser');
      console.log('Browser info:', this.browserInfo);
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

      // 브라우저별 Firebase 초기화 처리
      if (typeof firebase !== 'undefined') {
        console.log('Firebase SDK loaded successfully');
        
        // Firebase 앱 초기화
        if (!firebase.apps.length) {
          firebase.initializeApp(firebaseConfig);
          console.log('Firebase app initialized');
        }

        // Messaging 초기화 (Safari에서는 지원되지 않을 수 있음)
        try {
          if (firebase.messaging.isSupported()) {
            this.messaging = firebase.messaging();
            console.log('Firebase messaging initialized');
          } else {
            console.warn('Firebase messaging not supported in this browser');
            // Messaging 없이도 기본 기능은 동작하도록 함
          }
        } catch (messagingError) {
          console.warn('Firebase messaging initialization failed:', messagingError);
          // Messaging 실패해도 계속 진행
        }
      } else {
        console.error('Firebase SDK not loaded');
        return false;
      }

      console.log('FCM initialized successfully for browser:', this.browserInfo);
      return true;
    } catch (error) {
      console.error('Firebase initialization failed:', error);
      return false;
    }
  }

  // 알림 권한 요청 (브라우저별 최적화)
  async requestPermission() {
    try {
      console.log('Requesting notification permission for browser:', this.browserInfo);
      
      // Safari 특별 처리
      if (this.browserInfo.isSafari) {
        console.log('Safari detected - using legacy permission request');
        if ('webkitNotifications' in window) {
          const permission = window.webkitNotifications.checkPermission();
          if (permission === 0) {
            console.log('Safari: Notification permission already granted');
            return true;
          } else {
            console.log('Safari: Requesting notification permission');
            window.webkitNotifications.requestPermission();
            return window.webkitNotifications.checkPermission() === 0;
          }
        }
      }
      
      // 표준 Notification API
      if ('Notification' in window) {
        console.log('Current permission status:', Notification.permission);
        
        if (Notification.permission === 'granted') {
          console.log('Notification permission already granted');
          return true;
        } else if (Notification.permission === 'denied') {
          console.log('Notification permission denied by user');
          return false;
        } else {
          console.log('Requesting notification permission');
          const permission = await Notification.requestPermission();
          console.log('Permission result:', permission);
          return permission === 'granted';
        }
      } else {
        console.log('Notifications not supported in this browser');
        return false;
      }
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

  // Topic 알림 전송 (브라우저별 최적화)
  async sendTopicNotification(topic, title, body) {
    try {
      console.log(`Attempting to send notification to topic: ${topic} in browser:`, this.browserInfo);
      
      // 구독 확인
      const isSubscribed = this.isSubscribedToTopic(topic);
      console.log(`Subscription status for ${topic}:`, isSubscribed);
      
      if (!isSubscribed) {
        console.log(`Not subscribed to topic: ${topic}. Auto-subscribing...`);
        // 자동 구독 시도
        await this.subscribeToTopic(this.currentToken || 'auto-token', topic);
      }
      
      // 브라우저별 알림 전송 처리
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
          messageId: 'msg-' + Date.now(),
          browser: this.browserInfo.userAgent
        }
      };
      
      // 즉시 알림 표시
      this.showCustomNotification(payload);
      
      // 브라우저별 추가 처리
      if (this.browserInfo.isSafari) {
        // Safari에서는 추가적인 시각적 피드백 제공
        this.showSafariSpecificNotification(title, body, topic);
      }
      
      // 상태 저장
      const notificationHistory = JSON.parse(localStorage.getItem('notification_history') || '[]');
      notificationHistory.push({
        topic: topic,
        title: title,
        body: body,
        timestamp: new Date().toISOString(),
        status: 'sent',
        browser: this.browserInfo
      });
      localStorage.setItem('notification_history', JSON.stringify(notificationHistory));
      
      console.log(`Topic notification sent successfully: ${title}`);
      return true;
      
    } catch (error) {
      console.error('Topic notification error:', error);
      
      // 오류 시 폴백 알림
      this.showFallbackNotification(title, body, topic, error.message);
      return false;
    }
  }

  // Safari 전용 알림 처리
  showSafariSpecificNotification(title, body, topic) {
    console.log('Showing Safari-specific notification');
    
    // Safari에서는 추가적인 시각적 효과나 소리 등을 추가할 수 있음
    if ('webkitNotifications' in window) {
      try {
        // Safari 레거시 알림 API 사용
        const notification = new window.webkitNotifications.createNotification(
          './firebase-logo.png',
          title,
          `${body} (Topic: ${topic})`
        );
        notification.show();
        
        setTimeout(() => {
          notification.cancel();
        }, 5000);
      } catch (safariError) {
        console.log('Safari legacy notification failed:', safariError);
      }
    }
  }

  // 폴백 알림 (모든 브라우저 호환)
  showFallbackNotification(title, body, topic, errorMsg) {
    console.log('Showing fallback notification');
    
    // 단순한 alert 기반 폴백 (최후의 수단)
    const fallbackMessage = `
알림: ${title}
내용: ${body}
Topic: ${topic}
${errorMsg ? `오류: ${errorMsg}` : ''}
    `.trim();
    
    // 페이지 내 특별 알림 표시
    this.showInPageNotification(
      `🔔 ${title} (폴백)`,
      `${body}\n\n⚠️ 브라우저 알림이 지원되지 않아 페이지 내 알림으로 표시됩니다.`,
      topic
    );
    
    // 콘솔에도 표시
    console.warn('Fallback notification:', fallbackMessage);
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

  // 커스텀 알림 표시 (브라우저별 최적화)
  showCustomNotification(payload) {
    const { title, body, icon, tag } = payload.notification;
    const topic = payload.data?.topic;
    
    console.log('Showing notification in browser:', this.browserInfo);
    
    // 브라우저별 알림 처리
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        // 브라우저별 알림 옵션 조정
        const notificationOptions = {
          body: body,
          icon: icon || './firebase-logo.png',
          tag: tag || 'fcm-notification'
        };
        
        // Chrome/Edge: 추가 기능 지원
        if (this.browserInfo.isChrome || this.browserInfo.isEdge) {
          notificationOptions.requireInteraction = true;
          notificationOptions.badge = './firebase-logo.png';
        }
        
        // Firefox: 기본 옵션만 사용
        if (this.browserInfo.isFirefox) {
          // Firefox에서는 일부 옵션이 지원되지 않을 수 있음
          delete notificationOptions.requireInteraction;
        }
        
        // Safari: 간단한 옵션만 사용
        if (this.browserInfo.isSafari) {
          notificationOptions = {
            body: body,
            icon: icon || './firebase-logo.png'
          };
        }
        
        console.log('Creating notification with options:', notificationOptions);
        
        const notification = new Notification(title, notificationOptions);
        
        // 클릭 이벤트 처리
        notification.onclick = function(event) {
          console.log('Notification clicked');
          window.focus();
          notification.close();
        };
        
        // 오류 이벤트 처리
        notification.onerror = function(error) {
          console.error('Notification error:', error);
        };
        
        // 자동 닫기 (브라우저별 시간 조정)
        const autoCloseTime = this.browserInfo.isSafari ? 3000 : 5000;
        setTimeout(() => {
          try {
            notification.close();
          } catch (e) {
            console.log('Notification already closed');
          }
        }, autoCloseTime);
        
        console.log('Browser notification created successfully');
        
      } catch (notificationError) {
        console.error('Failed to create browser notification:', notificationError);
        // 브라우저 알림 실패 시 페이지 내 알림으로 폴백
      }
    } else {
      console.log('Browser notifications not available, showing in-page notification only');
    }

    // 모든 브라우저에서 페이지 내 알림 표시
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

  // 대기중 알림 확인 및 처리
  async checkPendingNotifications() {
    try {
      console.log('Checking for pending notifications...');
      
      // Service Worker 등록 확인
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
          console.log('Service Worker is registered');
          
          // 대기중인 알림 시뮬레이션 (실제로는 서버에서 가져와야 함)
          const pendingNotifications = this.getPendingNotificationsFromStorage();
          
          if (pendingNotifications.length > 0) {
            console.log(`Found ${pendingNotifications.length} pending notifications`);
            
            for (const notification of pendingNotifications) {
              await this.processPendingNotification(notification);
            }
            
            // 처리된 알림 제거
            this.clearPendingNotifications();
            return pendingNotifications.length;
          } else {
            console.log('No pending notifications found');
            return 0;
          }
        } else {
          console.log('Service Worker not registered, checking local pending notifications only');
          return this.checkLocalPendingNotifications();
        }
      } else {
        console.log('Service Worker not supported, checking local notifications only');
        return this.checkLocalPendingNotifications();
      }
    } catch (error) {
      console.error('Error checking pending notifications:', error);
      return 0;
    }
  }

  // 로컬 저장소에서 대기중 알림 가져오기
  getPendingNotificationsFromStorage() {
    const pending = localStorage.getItem('pending_notifications');
    return pending ? JSON.parse(pending) : [];
  }

  // 로컬 대기중 알림 확인
  checkLocalPendingNotifications() {
    const pendingNotifications = this.getPendingNotificationsFromStorage();
    
    if (pendingNotifications.length > 0) {
      console.log(`Processing ${pendingNotifications.length} local pending notifications`);
      
      pendingNotifications.forEach(notification => {
        this.processPendingNotification(notification);
      });
      
      this.clearPendingNotifications();
      return pendingNotifications.length;
    }
    
    return 0;
  }

  // 대기중 알림 처리
  async processPendingNotification(notification) {
    try {
      console.log('Processing pending notification:', notification);
      
      const payload = {
        notification: {
          title: notification.title + ' (대기중 알림)',
          body: notification.body,
          icon: './firebase-logo.png',
          tag: `pending-${notification.id || Date.now()}`
        },
        data: {
          topic: notification.topic || 'pending',
          timestamp: notification.timestamp || new Date().toISOString(),
          type: 'pending'
        }
      };
      
      this.showCustomNotification(payload);
      
      // 알림 히스토리에 추가
      const history = this.getNotificationHistory();
      history.push({
        ...notification,
        status: 'processed_from_pending',
        processedAt: new Date().toISOString()
      });
      localStorage.setItem('notification_history', JSON.stringify(history));
      
    } catch (error) {
      console.error('Error processing pending notification:', error);
    }
  }

  // 대기중 알림 추가 (테스트용)
  addPendingNotification(title, body, topic = 'fine2') {
    console.log('addPendingNotification called with:', { title, body, topic });
    
    try {
      const pendingNotifications = this.getPendingNotificationsFromStorage();
      
      const newNotification = {
        id: 'pending-' + Date.now(),
        title: title,
        body: body,
        topic: topic,
        timestamp: new Date().toISOString(),
        status: 'pending'
      };
      
      pendingNotifications.push(newNotification);
      localStorage.setItem('pending_notifications', JSON.stringify(pendingNotifications));
      
      console.log('Added pending notification:', newNotification);
      console.log('Total pending notifications:', pendingNotifications.length);
      
      return newNotification;
    } catch (error) {
      console.error('Error in addPendingNotification:', error);
      throw error;
    }
  }

  // 대기중 알림 제거
  clearPendingNotifications() {
    localStorage.removeItem('pending_notifications');
    console.log('Cleared all pending notifications');
  }

  // 정기적 대기중 알림 확인 시작
  startPendingNotificationChecker(intervalMs = 30000) { // 30초마다 확인
    if (this.pendingCheckInterval) {
      clearInterval(this.pendingCheckInterval);
    }
    
    console.log(`Starting pending notification checker (every ${intervalMs}ms)`);
    
    this.pendingCheckInterval = setInterval(async () => {
      const count = await this.checkPendingNotifications();
      if (count > 0) {
        console.log(`Processed ${count} pending notifications`);
      }
    }, intervalMs);
  }

  // 정기적 확인 중지
  stopPendingNotificationChecker() {
    if (this.pendingCheckInterval) {
      clearInterval(this.pendingCheckInterval);
      this.pendingCheckInterval = null;
      console.log('Stopped pending notification checker');
    }
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

    // 대기중 알림 확인
    const pendingCount = await this.checkPendingNotifications();
    if (pendingCount > 0) {
      console.log(`Found and processed ${pendingCount} pending notifications`);
    }

    // 정기적 대기중 알림 확인 시작
    this.startPendingNotificationChecker();

    console.log('FCM Manager initialized successfully');
    return true;
  }
}

// 전역 FCM 매니저 인스턴스
window.fcmManager = new FCMManager();
