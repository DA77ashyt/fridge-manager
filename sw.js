const CACHE_NAME = 'fridge-manager-v2';

// Install: skip waiting to activate immediately
self.addEventListener('install', () => {
    self.skipWaiting();
});

// Fetch: network first, fallback to cache
self.addEventListener('fetch', event => {
    event.respondWith(
        fetch(event.request)
            .then(response => {
                // Cache the fresh response
                const clone = response.clone();
                caches.open(CACHE_NAME).then(cache => {
                    cache.put(event.request, clone);
                });
                return response;
            })
            .catch(() => {
                // Offline fallback: serve from cache
                return caches.match(event.request);
            })
    );
});

// Activate: clean old caches and take control immediately
self.addEventListener('activate', event => {
    event.waitUntil(
        Promise.all([
            caches.keys().then(cacheNames => {
                return Promise.all(
                    cacheNames.filter(name => name !== CACHE_NAME)
                        .map(name => caches.delete(name))
                );
            }),
            self.clients.claim()
        ])
    );
});
