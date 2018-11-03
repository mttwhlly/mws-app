importScripts('js/idb.js');

var cacheID = 'restaurant-reviews-04';

// fetch('http://localhost:1337/restaurants', {
//     headers: {
//         "Content-Type": "application/json; charset=utf-8"
//     },
// })
//     .then(function(response){
//         //console.log('hello');
//         return response.json();
//     })
//     .then(function(data) {
//         idb.open('restaurantDb', 1, upgradeDB => {
//             var store = upgradeDB.createObjectStore('restaurants', {keyPath: 'id'});
//             //console.log(data);
//         }).then(function(dB) {
//             //console.log(dB)
//             var tr = dB.transaction('restaurants', 'readwrite');
//             var restaurantStore = tr.objectStore('restaurants');
//             data.forEach(function(restaurant) {
//                 restaurantStore.put(restaurant);
//             });
//         });
//     });

// fetch('http://localhost:1337/reviews', {
//     headers: {
//         "Content-Type": "application/json; charset=utf-8"
//     },
// })
//     .then(function(response){
//         //console.log('hello');
//         return response.json();
//     })
//     .then(function(data) {
//         idb.open('reviewDb', 1, upgradeDB => {
//             var store = upgradeDB.createObjectStore('reviews', {keyPath: 'id'});
//             //console.log(data);
//         }).then(function(dB) {
//             //console.log(dB)
//             var tr = dB.transaction('reviews', 'readwrite');
//             var reviewStore = tr.objectStore('reviews');
//             data.forEach(function(review) {
//                 reviewStore.put(review);
//             });
//         });
//     });

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

    event.respondWith(caches.match(cacheRequest).then(response => {
        return (
            response ||
                fetch(event.request)
                .then(fetchResponse => {
                    caches.open(cacheID).then(cache => {
                        cache.put(event.request, fetchResponse.clone())
                        return fetchResponse;
                    }).catch(function() {
                        console.log('something wrong with running fetch response function')
                        // Do nothing.
                    });
                })
                .catch(error => {
                    console.log(error);
                    return new Response('Oops, it looks like you are not connected to the internet', {
                        status: 404,
                        statusText: 'Not connected to the internet'
                    });
                })
            );
        })
    );
});
