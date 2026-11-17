
const buttons = document.querySelectorAll(".menu-btn");
const views = document.querySelectorAll(".view");

buttons.forEach(button => {
    button.addEventListener("click", () => {
        const target = button.dataset.view;

        buttons.forEach(item => item.classList.remove("active"));
        views.forEach(view => view.classList.remove("active"));

        button.classList.add("active");
        document.getElementById(target).classList.add("active");
    });
});

document.getElementById("cropForm").addEventListener("submit", async event => {
    event.preventDefault();

    const nombre = document.getElementById("cropName").value.trim();
    const area = Number(document.getElementById("cropArea").value);
    const descripcion = document.getElementById("cropDescription").value.trim();
    const ubicacion = window.ubicacionActual && Number.isFinite(window.ubicacionActual.latitud) ? {
        latitud: window.ubicacionActual.latitud,
        longitud: window.ubicacionActual.longitud
    } : {};

    if (!nombre || !Number.isFinite(area) || area <= 0) {
        alert("Ingresa un nombre y un área válida.");
        return;
    }

    const button = event.target.querySelector('button[type="submit"]');
    button.disabled = true;
    button.textContent = "Guardando...";

    try {
        await guardarCultivo({
            nombre,
            area,
            descripcion,
            fecha: new Date().toLocaleDateString("es-MX"),
            ...ubicacion
        });

        event.target.reset();
        document.getElementById("cropLocationSummary").textContent = "Sin ubicación registrada.";
        window.establecerUbicacionActual(null, null);

        await actualizarDashboard();

        alert("¡Cultivo guardado correctamente!");

    } catch (error) {
        console.error("Error al guardar cultivo:", error);
        alert("No se pudo guardar el cultivo: " + error.message);

    } finally {
        button.disabled = false;
        button.textContent = "Guardar cultivo";
    }
});

function actualizarSelectoresCultivos(cultivos) {
    const selectors = [
        document.getElementById("cropSelector"),
        document.getElementById("cameraCropSelector")
    ];

    selectors.forEach(selector => {
        if (!selector) return;

        const valorSeleccionado = selector.value;
        selector.innerHTML = '<option value="">Selecciona un cultivo</option>';

        cultivos.forEach(cultivo => {
            const option = document.createElement("option");
            option.value = String(cultivo.id);
            option.textContent = cultivo.nombre;
            if (String(valorSeleccionado) === String(cultivo.id)) {
                option.selected = true;
            }
            selector.appendChild(option);
        });
    });
}

function formatCoordinates(latitud, longitud) {
    if (latitud == null || longitud == null) return "Sin coordenadas";
    return `${Number(latitud).toFixed(5)}, ${Number(longitud).toFixed(5)}`;
}

async function actualizarUbicacionVista() {
    const cultivos = await obtenerCultivos();
    const container = document.getElementById("locationList");

    if (!container) return;

    container.innerHTML = "";

    const cropsWithLocation = cultivos.filter(cultivo =>
        cultivo.latitud != null && cultivo.longitud != null
    );

    if (cropsWithLocation.length === 0) {
        container.innerHTML = "<p>No hay cultivos con ubicación registrada.</p>";
        return;
    }

    cropsWithLocation.forEach(cultivo => {
        const item = document.createElement("div");
        item.className = "panel";

        const title = document.createElement("h3");
        title.textContent = cultivo.nombre;

        const coords = document.createElement("p");
        coords.textContent = `Coordenadas: ${formatCoordinates(cultivo.latitud, cultivo.longitud)}`;

        const map = document.createElement("iframe");
        map.src = `https://www.google.com/maps?q=${cultivo.latitud},${cultivo.longitud}&z=15&output=embed`;
        map.width = "100%";
        map.height = "220";
        map.style.border = "0";
        map.style.borderRadius = "10px";
        map.style.marginTop = "10px";

        item.append(title, coords, map);
        container.appendChild(item);
    });
}

async function actualizarDashboard() {
    const cultivos = await obtenerCultivos();
    const fotografias = await obtenerFotografias();

    document.getElementById("totalCultivos").textContent = cultivos.length;
    document.getElementById("totalFotos").textContent = fotografias.length;

    const list = document.getElementById("cropList");
    const recent = document.getElementById("recentActivity");

    actualizarSelectoresCultivos(cultivos);
    list.innerHTML = "";
    recent.innerHTML = "";

    if (cultivos.length === 0) {
        list.textContent = "No hay cultivos registrados.";
        recent.textContent = "Aún no hay cultivos registrados.";
        await actualizarUbicacionVista();
        return;
    }

    cultivos.slice().reverse().forEach(cultivo => {
        const item = document.createElement("div");
        item.className = "panel";

        const title = document.createElement("h3");
        title.textContent = cultivo.nombre;

        const area = document.createElement("p");
        area.textContent = `Área: ${cultivo.area} hectáreas`;

        const description = document.createElement("p");
        description.textContent = cultivo.descripcion || "Sin descripción";

        const location = document.createElement("p");
        location.textContent = `Ubicación: ${formatCoordinates(cultivo.latitud, cultivo.longitud)}`;

        const photoCount = document.createElement("p");
        const fotosCultivo = fotografias.filter(foto => Number(foto.cultivoId) === Number(cultivo.id));
        photoCount.textContent = `Fotos: ${fotosCultivo.length}`;

        const date = document.createElement("small");
        date.textContent = `Fecha: ${cultivo.fecha}`;

        item.append(title, area, description, location, photoCount, date);
        list.appendChild(item);
    });

    const last = cultivos[cultivos.length - 1];
    recent.textContent = `Último cultivo registrado: ${last.nombre}`;
    await actualizarUbicacionVista();
}

window.addEventListener("online", actualizarConexion);
window.addEventListener("offline", actualizarConexion);

function actualizarConexion() {
    const status = document.getElementById("connectionStatus");

    status.textContent = navigator.onLine
        ? "● Conectado"
        : "● Sin conexión";
}

document.addEventListener("DOMContentLoaded", async () => {
    try {
        await openDatabase();
        await actualizarDashboard();
        await mostrarGaleria();
        actualizarConexion();

        console.log("AgroTech inicializado correctamente.");

    } catch (error) {
        console.error("Error inicializando AgroTech:", error);
    }
});

if ("serviceWorker" in navigator) {
    window.addEventListener("load", async () => {
        try {
            await navigator.serviceWorker.register("./sw.js");
            console.log("Service Worker registrado.");
        } catch (error) {
            console.error("Error en Service Worker:", error);
        }
    });
}
