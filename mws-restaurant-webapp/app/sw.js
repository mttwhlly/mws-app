importScripts('js/idb.js');

var cacheID = 'restaurant-reviews-04';

const dBPromise = idb.open('restaurantDB', 1, upgradeDB => {
    switch(upgradeDB.oldVersion){
        case 0:
        upgradeDB.createObjectStore('restaurants', {keyPath: 'id'})
    }
});

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(cacheID).then(cache => {
            return cache
                .addAll([
                    '/manifest.json',
                    '/',
                    '/index.html',
                    '/restaurant.html',
                    '/css/styles.css',
                    '/js/dbhelper.js',
                    '/js/restaurant_info.js',
                    '/js/main.js',
                    '/js/register.js',
                    '/img/1.jpg',
                    '/img/2.jpg',
                    '/img/3.jpg',
                    '/img/4.jpg',
                    '/img/5.jpg',
                    '/img/6.jpg',
                    '/img/7.jpg',
                    '/img/8.jpg',
                    '/img/9.jpg',
                    '/img/10.jpg'
                ])
                .catch(error => {
                    console.log('cache failed: ' + error);
                });
        })
    );
});

self.addEventListener('fetch', event => {
    let cacheRequest = event.request;
    let cacheUrlObj = new URL(event.request.url);
    if (event.request.url.indexOf('restaurant.html') > 1) {
        const cacheURL = 'restaurant.html';
        cacheRequest = new Request(cacheURL);
    }
    if (cacheUrlObj.hostname !== 'localhost') {
        event.request.mode = 'no-cors';
    }
    event.respondWith(
        caches.match(cacheRequest).then(response => {
            return (
                response ||
                fetch(event.request)
                .then(fetchResponse => {
                    return caches.open(cacheID).then(cache => {
                        cache.put(event.request, fetchResponse.clone());
                        return fetchResponse;
                    });
                })
                .catch(error => {
                    return new Response('Oops, it looks like you are not connected to the internet', {
                        status: 404,
                        statusText: 'Not connected to the internet'
                    });
                })
            );
        })
    );
});
