// Firebase Messaging Service Worker - 간소화된 버전
// 외부 스크립트 로드 시도 및 오류 처리
try {
  importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
  importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');
  
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

  // Firebase 초기화
  firebase.initializeApp(firebaseConfig);
  const messaging = firebase.messaging();

  // 백그라운드 메시지 수신 처리
  messaging.onBackgroundMessage(function(payload) {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);
    
    const notificationTitle = payload.notification?.title || 'New Message';
    const notificationBody = payload.notification?.body || 'You have a new message';
    const topicInfo = payload.data?.topic ? ` (from ${payload.data.topic})` : '';
    
    const notificationOptions = {
      body: notificationBody + topicInfo,
      icon: './firebase-logo.svg',
      badge: './firebase-logo.svg',
      tag: 'fcm-notification',
      requireInteraction: true,
      data: {
        topic: payload.data?.topic || 'unknown',
        timestamp: payload.data?.timestamp || new Date().toISOString(),
        url: '/'
      },
      actions: [
        {
          action: 'open',
          title: '열기'
        },
        {
          action: 'close',
          title: '닫기'
        }
      ]
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
  });

} catch (error) {
  console.error('Service Worker initialization failed:', error);
  // Firebase 스크립트 로드 실패 시 기본 Service Worker로 작동
}

// 알림 클릭 이벤트 처리
self.addEventListener('notificationclick', function(event) {
  console.log('[SW]: Notification click received.', event);
  
  event.notification.close();
  
  if (event.action === 'open') {
    // 앱 열기
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Service Worker 설치 이벤트
self.addEventListener('install', function(event) {
  console.log('[SW]: Service Worker installing...');
  self.skipWaiting();
});

// Service Worker 활성화 이벤트
self.addEventListener('activate', function(event) {
  console.log('[SW]: Service Worker activating...');
  event.waitUntil(clients.claim());
});