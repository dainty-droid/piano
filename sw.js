// 네트워크 우선 서비스워커 (2026-11-17 관리자님 요청: 새로고침만으로 최신 반영).
// 온라인이면 항상 서버에서 새로 받고(받은 건 캐시에 갱신), 통신이 안 되거나 3초 넘게
// 응답이 없을 때만 캐시로 연다. 예전 캐시 우선 방식은 새 버전이 바로 안 떠서 바꿈.
// (주의: PowerShell Get-Content/Set-Content로 고치지 말 것 - 한글 주석이 깨짐)
const CACHE = 'note-quiz-v11';
const FILES = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png'];
const NET_TIMEOUT_MS = 3000;

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES.map(u => new Request(u, { cache: 'reload' })))));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});

function fromCache(req) {
  return caches.match(req, { ignoreSearch: true }).then(hit => {
    if (hit) return hit;
    if (req.mode === 'navigate') return caches.match('./index.html');
    return undefined;
  });
}

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  if (new URL(req.url).origin !== self.location.origin) return;
  e.respondWith(new Promise(resolve => {
    let done = false;
    const finish = r => { if (!done && r) { done = true; resolve(r); } };
    const timer = setTimeout(() => fromCache(req).then(finish), NET_TIMEOUT_MS);
    fetch(req).then(res => {
      if (res && res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
      clearTimeout(timer); finish(res);
    }).catch(() => {
      clearTimeout(timer);
      fromCache(req).then(hit => finish(hit || new Response('오프라인이고 저장된 화면도 없어요.', { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } })));
    });
  }));
});
