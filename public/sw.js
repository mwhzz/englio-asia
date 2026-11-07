// Offline-friendly service worker, tuned for slow networks:
// - app files have a hash in their name and never change, so they come straight from the cache;
// - the page itself tries the network for a moment, then uses the saved copy (no endless waiting on 2G);
// - uploaded pictures and recordings (/api/media/) and Google's handwriting fonts are kept once downloaded;
// - other API calls are left to the app (it keeps its own copy of the course), the admin is always live.
const CACHE = 'englio-v3';
const PAGE_WAIT_MS = 3000;

// On first install, save the page and every app file right away (offline-files.json is written by the
// build), so the app opens offline from the very first visit and every tab works on a bus with no signal.
// Pictures and recordings stay for "download for offline". A failed download never stops the install.
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    fetch('./offline-files.json')
      .then((r) => r.json())
      .then((files) => caches.open(CACHE).then((cache) => Promise.all(files.map((f) => cache.add(new URL(f, self.location).href).catch(() => undefined)))))
      .catch(() => undefined),
  );
});
self.addEventListener('activate', (event) =>
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  ),
);

const save = (request, response) => {
  if (response.ok || response.type === 'opaque') {
    const copy = response.clone();
    caches.open(CACHE).then((cache) => cache.put(request, copy));
  }
  return response;
};

/** The saved copy if there is one, else download and keep it. */
const cacheFirst = (request) => caches.match(request).then((hit) => hit || fetch(request).then((r) => save(request, r)));

/** The network, but only for a moment before falling back to the saved copy (which the download then refreshes). */
function networkSoon(request) {
  const fresh = fetch(request).then((r) => save(request, r));
  const saved = new Promise((done) => setTimeout(() => caches.match(request).then(done), PAGE_WAIT_MS));
  return Promise.race([fresh.catch(() => caches.match(request)), saved])
    .then((hit) => hit || fresh)
    .catch(() => caches.match(new URL('./', self.location).href));
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);

  if (url.pathname.includes('/api/media/') || url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    event.respondWith(cacheFirst(request));
    return;
  }
  if (url.origin !== self.location.origin || url.pathname.includes('/api/')) return;
  event.respondWith(url.pathname.includes('/assets/') ? cacheFirst(request) : networkSoon(request));
});

// "Download for offline" in settings: keep every app file, plus the pictures and recordings it lists.
self.addEventListener('message', (event) => {
  if (event.data?.type !== 'download') return;
  const port = event.ports[0];
  event.waitUntil(
    fetch('./offline-files.json')
      .then((r) => r.json())
      .then(async (files) => {
        const urls = [...files.map((f) => new URL(f, self.location).href), ...(event.data.media ?? [])];
        const cache = await caches.open(CACHE);
        let done = 0;
        for (const url of urls) {
          if (!(await cache.match(url))) await cache.add(url).catch(() => undefined);
          port?.postMessage({ done: ++done, total: urls.length });
        }
        port?.postMessage({ finished: true, total: urls.length });
      })
      .catch(() => port?.postMessage({ failed: true })),
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
      badge: './icon-badge-96.png',
      tag: 'daily-reminder',
      data: { url: data.url || './', variant: data.variant || 'open' },
    }),
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  // Anonymous count of reminders opened (the admin's reminder numbers).
  fetch(new URL('api/events', self.registration.scope), {
    method: 'POST',
    body: JSON.stringify({ events: [{ name: 'reminder_open', key: String(event.notification.data?.variant || 'open').slice(0, 40) }] }),
  }).catch(() => undefined);
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((tabs) => {
      const tab = tabs.find((t) => 'focus' in t);
      return tab ? tab.focus() : self.clients.openWindow(event.notification.data.url);
    }),
  );
});
