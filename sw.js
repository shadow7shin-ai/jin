/**
 * Office Manager AI Elite 3D v5.3.1 - Service Worker
 * 안드로이드 최적화 및 오프라인 구동을 위한 정적 에셋 캐싱
 */

const CACHE_NAME = 'office-manager-v5.3.1'; // 캐시 버전 번호 (업데이트 시 갱신)

// 캐싱할 필수 에셋 목록 (앱 아이콘 포함)
const ASSETS_TO_CACHE = [
  './',
  'index.html',
  'manifest.json',
  'https://cdn-icons-png.flaticon.com/512/1048/1048953.png', // 요청하신 달력 모양 아이콘
  'https://cdn.tailwindcss.com',
  'https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css'
];

// 1. 서비스 워커 설치 (Install): 에셋을 기기에 저장
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] 최신 에셋 캐싱 완료');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => self.skipWaiting()) // 즉시 활성화 유도
  );
});

// 2. 서비스 워커 활성화 (Activate): 이전 버전의 낡은 캐시 삭제
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] 이전 버전 캐시 삭제:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim()) // 현재 열려있는 페이지 제어권 획득
  );
});

// 3. 네트워크 요청 처리 (Fetch): 캐시 우선 전략 사용
self.addEventListener('fetch', (event) => {
  // 실시간 데이터 동기화(Firebase) 및 AI API 호출은 캐싱에서 제외
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
        // 캐시에 있으면 즉시 반환하여 속도 향상, 없으면 네트워크에서 가져옴
        return response || fetch(event.request);
      })
  );
});