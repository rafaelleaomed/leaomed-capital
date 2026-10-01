// Service Worker LeãoMed Capital - Versão 2 (Resiliente)
const CACHE_NAME = 'leaomed-pwa-v2';

// Apenas assets estáticos imutáveis (NUNCA incluir rotas dinâmicas como '/')
const STATIC_ASSETS = [
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
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('[SW] Falha ao pré-cachear assets estáticos:', err);
      });
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
  // 1. Só intercepta GET
  if (event.request.method !== 'GET') {
    return;
  }

  const url = new URL(event.request.url);

  // 2. CRÍTICO: NUNCA interceptar domínios externos (Supabase, Google OAuth, etc.)
  if (url.origin !== self.location.origin) {
    return;
  }

  // 3. CRÍTICO: NUNCA interceptar APIs, rotas de autenticação ou chunks do Next.js em runtime
  if (
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/auth/') ||
    url.pathname.startsWith('/_next/data/')
  ) {
    return;
  }

  // 4. Se for asset de mídia ou ícone pré-cacheado, responde Cache-First para alta velocidade
  const isStaticMedia =
    url.pathname.startsWith('/icon-') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.jpg') ||
    url.pathname.endsWith('.ico') ||
    url.pathname === '/manifest.json';

  if (isStaticMedia) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const copy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, copy);
            });
          }
          return networkResponse;
        });
      })
    );
    return;
  }

  // 5. Para navegações de páginas (/dashboard, /login, /, etc.), NÃO bloquear com catch cego.
  // Deixa o navegador gerenciar a rede diretamente para não disparar TypeError em redirects 307.
});
