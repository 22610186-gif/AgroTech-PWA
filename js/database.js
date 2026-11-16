
const DB_NAME = "AgroTechDB";
const DB_VERSION = 1;

let db;

function openDatabase() {
    return new Promise((resolve, reject) => {
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
            db = request.result;
            resolve(db);
        };

        request.onerror = () => reject(request.error);
    });
}

async function guardarCultivo(cultivo) {
    const database = await openDatabase();

    return new Promise((resolve, reject) => {
        const transaction = database.transaction("cultivos", "readwrite");
        const request = transaction.objectStore("cultivos").add(cultivo);

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

async function obtenerCultivos() {
    const database = await openDatabase();

    return new Promise((resolve, reject) => {
        const transaction = database.transaction("cultivos", "readonly");
        const request = transaction.objectStore("cultivos").getAll();

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

async function guardarFotografia(fotografia) {
    const database = await openDatabase();

    return new Promise((resolve, reject) => {
        const transaction = database.transaction("fotografias", "readwrite");
        const request = transaction.objectStore("fotografias").add({
            imagen: fotografia,
            fecha: new Date().toISOString()
        });

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

async function obtenerFotografias() {
    const database = await openDatabase();

    return new Promise((resolve, reject) => {
        const transaction = database.transaction("fotografias", "readonly");
        const request = transaction.objectStore("fotografias").getAll();

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}
