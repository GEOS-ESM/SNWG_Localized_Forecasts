const CACHE_NAME = 'snwg-forecasts-v1';
const STATIC_CACHE_NAME = 'snwg-static-v1';
const DATA_CACHE_NAME = 'snwg-data-v1';

const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/parametres/lf-style.css',
    '/parametres/wave.css',
    '/parametres/wavejs.js',
    '/parametres/plotly-2.12.1.min.js',
    '/local_forecasts.js',
    '/local_forecasts_assets.js',
    '/geotiff_manager.js',
    '/vues/home.html',
    '/vues/about.html',
    '/parametres/snwg_logo_blue.svg',
    '/parametres/ESD-logo.png',
    '/parametres/Marron_logo.png',
    '/parametres/favicon-32x32.png',
    '/parametres/favicon-16x16.png',
    '/precomputed/sites_index.json'
];

const CDN_PATTERNS = [
    'cdn.jsdelivr.net',
    'unpkg.com',
    'code.jquery.com',
    'd3js.org',
    'cdnjs.cloudflare.com',
    'fonts.gstatic.com',
    'basemaps.cartocdn.com'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(STATIC_CACHE_NAME)
            .then(cache => {
                console.log('Caching static assets');
                return cache.addAll(STATIC_ASSETS.map(url => {
                    return new Request(url, { cache: 'reload' });
                })).catch(err => {
                    console.log('Some static assets failed to cache:', err);
                    return Promise.resolve();
                });
            })
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames
                    .filter(name => name.startsWith('snwg-') && 
                            name !== STATIC_CACHE_NAME && 
                            name !== DATA_CACHE_NAME)
                    .map(name => caches.delete(name))
            );
        }).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);

    if (request.method !== 'GET') {
        return;
    }

    if (!url.protocol.startsWith('http')) {
        return;
    }

    if (url.hostname === 'api.github.com') {
        event.respondWith(fetch(request).catch(() => {
            return new Response(JSON.stringify({ error: 'Offline' }), {
                headers: { 'Content-Type': 'application/json' }
            });
        }));
        return;
    }

    if (url.pathname.includes('/precomputed/') && 
        (url.pathname.endsWith('.json') || url.pathname.endsWith('.json.gz'))) {
        event.respondWith(
            caches.open(DATA_CACHE_NAME).then(cache => {
                return cache.match(request).then(cachedResponse => {
                    const fetchPromise = fetch(request).then(networkResponse => {
                        if (networkResponse.ok) {
                            cache.put(request, networkResponse.clone());
                        }
                        return networkResponse;
                    }).catch(() => cachedResponse);

                    return cachedResponse || fetchPromise;
                });
            })
        );
        return;
    }

    const isCDN = CDN_PATTERNS.some(pattern => url.hostname.includes(pattern));
    if (isCDN) {
        event.respondWith(
            caches.match(request).then(cachedResponse => {
                if (cachedResponse) {
                    return cachedResponse;
                }
                return fetch(request).then(response => {
                    if (response.ok) {
                        const responseClone = response.clone();
                        caches.open(STATIC_CACHE_NAME).then(cache => {
                            cache.put(request, responseClone);
                        });
                    }
                    return response;
                });
            })
        );
        return;
    }

    if (url.hostname.includes('basemaps.cartocdn.com') || 
        url.hostname.includes('tile.openstreetmap.org') ||
        url.hostname.includes('arcgisonline.com')) {
        event.respondWith(
            caches.open('snwg-tiles-v1').then(cache => {
                return cache.match(request).then(cachedResponse => {
                    if (cachedResponse) {
                        return cachedResponse;
                    }
                    return fetch(request).then(response => {
                        if (response.ok) {
                            cache.put(request, response.clone());
                        }
                        return response;
                    });
                });
            })
        );
        return;
    }

    event.respondWith(
        fetch(request)
            .then(response => {
                if (response.ok && request.url.includes(self.location.origin)) {
                    const responseClone = response.clone();
                    caches.open(STATIC_CACHE_NAME).then(cache => {
                        cache.put(request, responseClone);
                    });
                }
                return response;
            })
            .catch(() => {
                return caches.match(request);
            })
    );
});

self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    if (event.data && event.data.type === 'CLEAR_CACHE') {
        caches.keys().then(names => {
            names.forEach(name => caches.delete(name));
        });
    }
});
