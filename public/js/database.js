
const DB_NAME = "AgroTechDB";
const DB_VERSION = 1;

let dbPromise = null;

function openDatabase() {
    if (dbPromise) return dbPromise;

    dbPromise = new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
            const database = event.target.result;

            if (!database.objectStoreNames.contains("cultivos")) {
                database.createObjectStore("cultivos", {
                    keyPath: "id",
                    autoIncrement: true
                });
            }

            if (!database.objectStoreNames.contains("fotografias")) {
                database.createObjectStore("fotografias", {
                    keyPath: "id",
                    autoIncrement: true
                });
            }
        };

        request.onsuccess = () => {
            const database = request.result;

            database.onversionchange = () => {
                database.close();
                dbPromise = null;
            };

            resolve(database);
        };

        request.onerror = () => {
            dbPromise = null;
            reject(request.error);
        };

        request.onblocked = () => {
            console.warn("La base de datos está bloqueada por otra conexión.");
        };
    });

    return dbPromise;
}

async function ejecutarTransaccion(storeName, mode, operation) {
    const database = await openDatabase();

    return new Promise((resolve, reject) => {
        const transaction = database.transaction(storeName, mode);
        const store = transaction.objectStore(storeName);

        let result;

        transaction.oncomplete = () => resolve(result);

        transaction.onerror = () => reject(
            transaction.error || new Error("Error en la transacción")
        );

        transaction.onabort = () => reject(
            transaction.error || new Error("Transacción cancelada")
        );

        try {
            const request = operation(store);

            if (request) {
                request.onsuccess = () => {
                    result = request.result;
                };

                request.onerror = () => {
                    // La transacción gestionará el error.
                };
            }
        } catch (error) {
            transaction.abort();
            reject(error);
        }
    });
}

async function guardarCultivo(cultivo) {
    return ejecutarTransaccion(
        "cultivos",
        "readwrite",
        store => store.add(cultivo)
    );
}

async function obtenerCultivos() {
    return ejecutarTransaccion(
        "cultivos",
        "readonly",
        store => store.getAll()
    );
}

async function guardarFotografia(imagen, cultivoId = null) {
    return ejecutarTransaccion(
        "fotografias",
        "readwrite",
        store => store.add({
            imagen,
            cultivoId,
            fecha: new Date().toISOString()
        })
    );
}

async function obtenerFotografias() {
    return ejecutarTransaccion(
        "fotografias",
        "readonly",
        store => store.getAll()
    );
}

async function eliminarFotografia(id) {
    return ejecutarTransaccion(
        "fotografias",
        "readwrite",
        store => store.delete(id)
    );
}

async function actualizarCultivo(id, cambios) {
    const database = await openDatabase();

    return new Promise((resolve, reject) => {
        const transaction = database.transaction("cultivos", "readwrite");
        const store = transaction.objectStore("cultivos");
        const getRequest = store.get(id);

        getRequest.onsuccess = () => {
            const cultivoActual = getRequest.result;

            if (!cultivoActual) {
                resolve(null);
                return;
            }

            const cultivoActualizado = { ...cultivoActual, ...cambios };
            const putRequest = store.put(cultivoActualizado);

            putRequest.onsuccess = () => resolve(cultivoActualizado);
            putRequest.onerror = () => reject(putRequest.error);
        };

        getRequest.onerror = () => reject(getRequest.error);
    });
}
