// Network-first service worker: always try fresh content, fall back to cache offline.
const CACHE = 'englio-v1';

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  // Google's handwriting fonts (letters page) never change: keep them after the first download.
  if (request.method === 'GET' && (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com')) {
    event.respondWith(
      caches.match(request).then(
        (hit) =>
          hit ||
          fetch(request).then((response) => {
            const copy = response.clone();
            caches.open(CACHE).then((cache) => cache.put(request, copy));
            return response;
          }),
      ),
    );
    return;
  }
  // The admin panel's data must always be live, never a cached copy.
  if (request.method !== 'GET' || url.origin !== self.location.origin || url.pathname.includes('/api/admin')) return;
  event.respondWith(
    fetch(request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE).then((cache) => cache.put(request, copy));
        return response;
      })
      .catch(() =>
        caches.match(request).then((hit) => hit || caches.match(new URL('./', self.location).href)),
      ),
  );
});

// Daily reminder pushed by the server (see server/reminders.ts and docs/SERVER.md).
self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = {};
  }
  event.waitUntil(
    self.registration.showNotification(data.title || 'আজকের ইংরেজি বাকি!', {
      body: data.body || 'মাত্র ৫ মিনিট। একটা লেসন করে স্ট্রিক ধরে রাখো।',
      icon: './icon-192.png',
      badge: './icon-192.png',
      tag: 'daily-reminder',
      data: { url: data.url || './' },
    }),
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((tabs) => {
      const tab = tabs.find((t) => 'focus' in t);
      return tab ? tab.focus() : self.clients.openWindow(event.notification.data.url);
    }),
  );
});
