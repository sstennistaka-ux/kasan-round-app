// アプリ本体を更新したら CACHE_NAME の番号を上げてください（v1 → v2）。上げないと古いキャッシュが使われ続けます
const CACHE_NAME = 'kasan-round-app-v1';
const CORE_ASSETS = ['./', './index.html', './items.js', './jszip.min.js', './template.xlsx', './manifest.json',
  './icons/icon-192.png', './icons/icon-512.png', './icons/apple-touch-icon.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then((c) => c.addAll(CORE_ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys()
    .then((ns) => Promise.all(ns.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n))))
    .then(() => self.clients.claim()));
});
// ネットワーク優先・失敗時はキャッシュ（院内の電波が弱くても使えるように）
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request).then((res) => {
      if (res && res.status === 200) { const cl = res.clone(); caches.open(CACHE_NAME).then((c) => c.put(e.request, cl)); }
      return res;
    }).catch(() => caches.match(e.request, { ignoreSearch: true }))
  );
});
