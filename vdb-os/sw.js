const CACHE_NAME = 'vdb-singularity-os-cache-v2.0'; // Updated version
const urlsToCache = [
  '/',
  '/.htaccess',
  '/index.html',
  '/index.tsx',
  '/metadata.json',
  '/manifest.json',
  '/config.ts',
  '/utils/audioUtils.ts',
  '/utils/tools.ts',
  '/App.tsx',
  '/components/types.ts',
  '/components/TopBar.tsx',
  '/components/Dock.tsx',
  '/components/TerminalApp.tsx',
  '/components/CodeEditorApp.tsx',
  '/components/CameraApp.tsx',
  '/components/SettingsApp.tsx',
  '/components/PhoneApp.tsx',
  '/components/GalleryApp.tsx',
  '/components/DiagnosticsApp.tsx',
  '/components/AudioVisualizer.tsx',
  '/components/ContactsApp.tsx',
  '/icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  // We only want to handle GET requests.
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        // Not in cache - fetch from network
        return fetch(event.request).then(
          (networkResponse) => {
            // Check if we received a valid response
            if(!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              // Don't cache invalid responses
              return networkResponse;
            }

            const responseToCache = networkResponse.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return networkResponse;
          }
        ).catch(error => {
            console.error('Fetch failed; the device is likely offline.', error);
        });
      })
  );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            // Delete old caches
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
