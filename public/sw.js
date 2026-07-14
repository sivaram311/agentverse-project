self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((key) => caches.delete(key))),
    ).then(() => self.clients.claim()),
  );
});

/**
 * Network-only fetch: never cache HTML/RSC so Next.js navigations stay fresh.
 * Last-session restore is handled in-app via localStorage (not clients.openWindow).
 */
self.addEventListener("fetch", (event) => {
  event.respondWith(fetch(event.request));
});
