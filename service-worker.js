const CACHE_NAME = 'Weather_app';

let resourcesToCache = ["./", "./images/sun.png", "./index.js", "./styles.css"];

self.addEventListener("install", e=>{
    e.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(resourcesToCache);
        })
    );
});

self.addEventListener("fetch", e=>{
    e.respondWith(
        caches.match(e.request).then(response=>{
            return response || fetch(e.request);
        })
    );
});

const cacheWhitelist = ['Weather_app'];
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName)
                    }
                })
            );
        })
    );
});