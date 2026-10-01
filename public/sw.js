// Service Worker leve para PWA LeãoMed Capital
const CACHE_NAME = 'leaomed-pwa-v1';
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png',
  '/icon-maskable-192x192.png',
  '/icon-maskable-512x512.png',
  '/apple-touch-icon.png',
  '/favicon.ico',
  '/logo.jpg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch(() => {});
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Ignora requisições não-GET ou extensões do Chrome
  if (event.request.method !== 'GET' || !event.request.url.startsWith('http')) {
    return;
  }

  // Network First para APIs e páginas dinâmicas, fallback para cache se offline
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Se a resposta for válida e for asset estático, atualiza o cache
        if (response && response.status === 200 && response.type === 'basic') {
          const responseToCache = response.clone();
          const url = new URL(event.request.url);
          if (
            url.pathname.startsWith('/icon-') ||
            url.pathname.endsWith('.png') ||
            url.pathname.endsWith('.jpg') ||
            url.pathname.endsWith('.ico') ||
            url.pathname === '/manifest.json'
          ) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
        }
        return response;
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );
});
