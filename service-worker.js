
// Only caching needs to be implemented, no other ServiceWorker features.
/*addEventListener('install', function(event) {
  event.waitUntil(
    caches.open('restaurantCache').then(function(cache) {
      return cache.addAll([
        '/',
        'css/styles.css',
        'img/1.jpg',
        'img/2.jpg',
        'img/3.jpg',
        'img/4.jpg',
        'img/5.jpg',
        'img/6.jpg',
        'img/7.jpg',
        'img/8.jpg',
        'img/9.jpg',
        'img/10.jpg',
        'img/1-400.jpg',
        'img/2-400.jpg',
        'img/3-400.jpg',
        'img/4-400.jpg',
        'img/5-400.jpg',
        'img/6-400.jpg',
        'img/7-400.jpg',
        'img/8-400.jpg',
        'img/9-400.jpg',
        'img/10-400.jpg',
        'img/1-250.jpg',
        'img/2-250.jpg',
        'img/3-250.jpg',
        'img/4-250.jpg',
        'img/5-250.jpg',
        'img/6-250.jpg',
        'img/7-250.jpg',
        'img/8-250.jpg',
        'img/9-250.jpg',
        'img/10-250.jpg',
        'js/main.js',
        'js/idb.js',
        'js/dbhelper.js',
        'js/indexeddb.js',
        'js/restaurant_info.js']);
      })
  );
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
    .then(function(response) {
        if (response) return response;
        return fetch(event.request);
    }));
});
*/

//sample code for examples of intercepting fetch requests
/*self.addEventListener('fetch', function(event) {
  console.log('fetched from SW js: ', event.request);
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    new Response('HEY!'));
});*/
