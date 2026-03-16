/**
 * Office Manager AI Elite 3D v5.3.0 - Service Worker
 * 오프라인 지원 및 정적 에셋(새 아이콘 포함) 캐싱 담당
 */

const CACHE_NAME = 'office-manager-v5.3.0';

// 캐싱할 에셋 목록 (앱 구동에 필수적인 파일 및 새 아이콘 주소)
const ASSETS_TO_CACHE = [
  './',
  'index.html',
  'manifest.json',
  'https://cdn-icons-png.flaticon.com/512/1048/1048953.png', // 새로 바뀐 달력 아이콘
  'https://cdn.tailwindcss.com',
  'https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css'
];

// 서비스 워커 설치: 설정된 파일들을 기기 저장소에 캐싱
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] 최신 에셋 캐싱 중...');
        return cache.addAll(ASSETS_TO_CACHE);
      })
  );
});

// 서비스 워커 활성화: 이전 버전(v5.2.x 이하)의 오래된 캐시 삭제
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
    })
  );
});

// 네트워크 요청 가로채기
self.addEventListener('fetch', (event) => {
  // 실시간 데이터(Firebase) 및 AI API(Google) 요청은 항상 최신 데이터를 위해 캐싱에서 제외
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
        // 캐시에 있으면 즉시 반환(속도 향상), 없으면 네트워크에서 가져옴
        return response || fetch(event.request);
      })
  );
});