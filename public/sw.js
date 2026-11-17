
const STATIC_CACHE = "agrotech-shell-v2";
const DYNAMIC_CACHE = "agrotech-dynamic-v2";

const APP_SHELL = [
    "./",
    "./index.html",
    "./manifest.json",
    "./css/styles.css",
    "./js/app.js",
    "./js/database.js",
    "./js/camera.js",
    "./js/location.js"
];

// Instalar App Shell
self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then(cache => cache.addAll(APP_SHELL))
            .then(() => self.skipWaiting())
    );
});

// Activar y limpiar versiones antiguas
self.addEventListener("activate", event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(
                keys
                    .filter(key =>
                        key !== STATIC_CACHE &&
                        key !== DYNAMIC_CACHE
                    )
                    .map(key => caches.delete(key))
            )
        ).then(() => self.clients.claim())
    );
});

// Administrar solicitudes
self.addEventListener("fetch", event => {
    const request = event.request;

    if (request.method !== "GET") return;

    const url = new URL(request.url);

    if (url.origin !== self.location.origin) return;

    // Navegación: primero red, después App Shell
    if (request.mode === "navigate") {
        event.respondWith(
            fetch(request).then(response => {
                const copy = response.clone();

                caches.open(DYNAMIC_CACHE).then(cache =>
                    cache.put(request, copy)
                );

                return response;
            }).catch(async () => {
                return await caches.match(request) ||
                       await caches.match("./index.html");
            })
        );

        return;
    }

    // Recursos principales: primero caché
    event.respondWith(
        caches.match(request).then(async cached => {
            if (cached) return cached;

            try {
                const response = await fetch(request);

                if (response.ok) {
                    const copy = response.clone();

                    const cache = await caches.open(DYNAMIC_CACHE);
                    await cache.put(request, copy);
                }

                return response;

            } catch (error) {
                return new Response("Recurso no disponible sin conexión.", {
                    status: 503,
                    headers: {
                        "Content-Type": "text/plain; charset=utf-8"
                    }
                });
            }
        })
    );
});
