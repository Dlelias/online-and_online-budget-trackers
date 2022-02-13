const FILES_TO_CACHE = [
    "/icons/icon-192x192.png",
    "/icons/icon-512x512.png",
    "/icons/icon-144x144.png",
    "/icons/budget.png",
    "/",
    "/index.html",
    "/index.js",
    "/manifest.webmanifest",
    "/db.js",
    "/styles.css",
];

const CACHE_NAME ="static-cache-v2";
const DATA_CACHE_NAME = "data-cache-v1";
// installe and register service worker 
self.addEventListener("install", function(evt) {
    evt.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log("Your files were successfully pre-cached");
            return cache.addAll(FILES_TO_CACHE);
        })
    );
    self.skipWaiting();
}) ;
// activiating the service wroker and remove old data from cache 
self.addEventListener("activate", function(evt) {
    evt.waitUntil(
        caches.keys().then((keyList) => {
            return Promise.all(
                keyList.map((key) => {
                    if (key !== CACHE_NAME && KEY !== DATA_CACHE_NAME) {
                        console.log("Removing old cache data", key);
                        return caches.delete(key);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// enable service worker to internet network requests
self.addEventListener("fetch", function (evt) {
    if (evt.request.url.includes("/api")) {
        evt.respondWith(
            caches.open(DATA_CACHE_NAME).then((cache) => {
                return fetch(evt.request)
                .then((response) => {
                    // if the response is good , clone and store in cache
                    if(response.status === 200) {
                        cache.put(evt.request.url, response.clone());
                    }
                    return response;
                })
                .catch((err) => {
                    // network request failed, try to get it from cache
                    return cache.match(evt.request);
                });
            })
            .catch((err) => console.log(err))
        );
        return;
    }
    // code to handle request 
    evt.respondWith(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.match(evt.request).then(response => {
                return response || fetch(evt.request);
            });
        })
    );
});

