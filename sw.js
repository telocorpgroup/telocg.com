const CACHE_NAME = 'telocorp-v4.2';
const ASSETS = [
  './',
  './index.html',
  './styles.css',
  './script.js',
  './manifest.json',
  './assets/telocorpgroup-logo.jpg',
  './assets/telocorpgroup-mark.png'
];

// Offline fallback page (inline)
const OFFLINE_PAGE = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>TeloCorp — Sin conexión</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{min-height:100vh;display:flex;align-items:center;justify-content:center;font-family:Inter,system-ui,sans-serif;background:#0a0f1a;color:#e2e8f0;padding:24px}
.container{text-align:center;max-width:400px}
.icon{font-size:64px;margin-bottom:16px}
h1{font-size:1.5rem;margin-bottom:8px;color:#f97316}
p{color:#94a3b8;line-height:1.6;margin-bottom:24px}
.btn{display:inline-block;padding:12px 24px;background:#f97316;color:#fff;border:none;border-radius:8px;font-weight:600;cursor:pointer;text-decoration:none;font-size:1rem}
.btn:hover{background:#ea580c}
</style>
</head>
<body>
<div class="container">
<div class="icon">📡</div>
<h1>Sin conexión</h1>
<p>Parece que no tienes conexión a internet. Algunas funciones requieren conexión para funcionar correctamente.</p>
<button class="btn" onclick="location.reload()">Reintentar</button>
</div>
</body>
</html>`;

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async cache => {
      await cache.addAll(ASSETS);
      // Cache the offline fallback
      await cache.put('/offline.html', new Response(OFFLINE_PAGE, {
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
      }));
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin API calls (Supabase, CDN, analytics)
  if (!url.origin.includes(self.location.hostname) && !url.pathname.endsWith('.css') && !url.pathname.endsWith('.js')) return;

  // Navigation requests: network-first with offline fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => caches.match(request).then(cached => cached || caches.match('/offline.html')))
    );
    return;
  }

  // Static assets: stale-while-revalidate
  event.respondWith(
    caches.match(request).then(cached => {
      const fetchPromise = fetch(request).then(response => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
        }
        return response;
      }).catch(() => cached);

      return cached || fetchPromise;
    })
  );
});
