/**
 * Import IDB
 */
importScripts('js/idb.js');

/**
 * Variables
 */
var cacheID = 'restaurant-reviews-04';

/**
 * On install event add things to cache
 */
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(cacheID).then(cache => {
            return cache
                .addAll([
                    '/manifest.json',
                    '/',
                    '/sw.js',
                    '/index.html',
                    '/restaurant.html',
                    '/css/styles.css',
                    '/css/leaflet.css',
                    '/js/dbhelper.js',
                    '/js/restaurant_info.js',
                    '/js/main.js',
                    '/js/idb.js',
                    '/img/1.jpg',
                    '/img/2.jpg',
                    '/img/3.jpg',
                    '/img/4.jpg',
                    '/img/5.jpg',
                    '/img/6.jpg',
                    '/img/7.jpg',
                    '/img/8.jpg',
                    '/img/9.jpg',
                    '/img/10.jpg',
                    '/img/undefined.jpg',
                    '/favicon.ico'
                ])
                .catch(error => {
                    console.log('cache failed: ' + error);
                });
        })
    );
});

/**
 * On fetch
 */
self.addEventListener('fetch', event => {
    let cacheRequest = event.request;
    let cacheUrlObj = new URL(event.request.url);
    if (event.request.url.indexOf('restaurant.html') > 1) {
        const cacheURL = 'restaurant.html';
        cacheRequest = new Request(cacheURL);
    }
    if (cacheUrlObj.hostname !== 'localhost') {
        event.request.mode = 'no-cors';
        //console.log('fetch running with no-cors')
    }
    event.respondWith(caches.match(event.request).then(function (response) {
        return response || fetch(event.request);
    }));
});
