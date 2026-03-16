/**
 * Office Manager AI Elite 3D v5.3.2 - Service Worker
 * 버전 업데이트를 통해 모든 설정(확대 허용, 아이콘 등)을 기기에 강제 반영함
 */

const CACHE_NAME = 'office-manager-v5.3.2'; 

// 캐싱할 필수 에셋 목록
const ASSETS_TO_CACHE = [
  './',
  'index.html',
  'manifest.json',
  'https://cdn-icons-png.flaticon.com/512/1048/1048953.png',
  'https://cdn.tailwindcss.com',
  'https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css'
];

// 서비스 워커 설치 (Install)
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] v5.3.2 에셋 캐싱 중...');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => self.skipWaiting()) // 업데이트 즉시 활성화
  );
});

// 서비스 워커 활성화 (Activate) - 이전 버전의 낡은 캐시 삭제
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] 이전 캐시 삭제:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim()) // 현재 페이지 제어권 즉시 획득
  );
});

// 네트워크 요청 처리 (Fetch)
self.addEventListener('fetch', (event) => {
  // Firebase 및 Google API 요청은 실시간 데이터를 위해 캐싱에서 제외
  if (
    event.request.url.includes('google') || 
    event.request.url.includes('firestore') || 
    event.request.url.includes('googleapis')
  ) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // 캐시에 있으면 즉시 사용, 없으면 네트워크에서 가져옴
        return response || fetch(event.request);
      })
  );
});