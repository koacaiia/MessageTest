// Firebase Messaging Service Worker
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

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

// Firebase 초기화
firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

// 백그라운드 메시지 수신 처리
messaging.onBackgroundMessage(function(payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: './firebase-logo.png',
    badge: './firebase-logo.png',
    tag: 'fcm-notification',
    requireInteraction: true,
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
