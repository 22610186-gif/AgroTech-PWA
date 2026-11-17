
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
            fecha: new Date().toLocaleDateString("es-MX")
        });

        event.target.reset();

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

async function actualizarDashboard() {
    const cultivos = await obtenerCultivos();
    const fotografias = await obtenerFotografias();

    document.getElementById("totalCultivos").textContent = cultivos.length;
    document.getElementById("totalFotos").textContent = fotografias.length;

    const list = document.getElementById("cropList");
    const recent = document.getElementById("recentActivity");

    list.innerHTML = "";
    recent.innerHTML = "";

    if (cultivos.length === 0) {
        list.textContent = "No hay cultivos registrados.";
        recent.textContent = "Aún no hay cultivos registrados.";
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

        const date = document.createElement("small");
        date.textContent = `Fecha: ${cultivo.fecha}`;

        item.append(title, area, description, date);
        list.appendChild(item);
    });

    const last = cultivos[cultivos.length - 1];
    recent.textContent = `Último cultivo registrado: ${last.nombre}`;
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
