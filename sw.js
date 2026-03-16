/**
 * Office Manager AI Elite 3D v5.3.0 - Service Worker
 * 오프라인 지원 및 정적 에셋 캐싱 담당
 */

const CACHE_NAME = 'office-manager-v5.3.0';

// 캐싱할 에셋 목록 (앱 구동에 필수적인 파일들)
const ASSETS_TO_CACHE = [
  './',
  'index.html',
  'manifest.json',
  'https://cdn.tailwindcss.com',
  'https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css'
];

// 서비스 워커 설치: 설정된 파일들을 기기 저장소에 캐싱
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] 에셋 캐싱 중...');
        return cache.addAll(ASSETS_TO_CACHE);
      })
  );
});

// 서비스 워커 활성화: 이전 버전의 캐시 정리
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
    })
  );
});

// 네트워크 요청 가로채기: 캐시된 파일이 있으면 즉시 반환하여 로딩 속도 향상
self.addEventListener('fetch', (event) => {
  // 실시간 데이터 전송(Firebase) 및 AI API(Google) 요청은 캐싱에서 제외
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
        // 캐시에 있으면 캐시 데이터 사용, 없으면 네트워크에서 가져옴
        return response || fetch(event.request);
      })
  );
});