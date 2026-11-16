
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

document.getElementById("cropForm").addEventListener("submit", async (event) => {
    event.preventDefault();

    const cultivo = {
        nombre: document.getElementById("cropName").value.trim(),
        area: Number(document.getElementById("cropArea").value),
        descripcion: document.getElementById("cropDescription").value.trim(),
        fecha: new Date().toLocaleDateString()
    };

    if (!cultivo.nombre || !Number.isFinite(cultivo.area) || cultivo.area <= 0) {
        alert("Verifica los datos del cultivo.");
        return;
    }

    try {
        await guardarCultivo(cultivo);

        event.target.reset();

        await actualizarDashboard();

        alert("Cultivo registrado correctamente.");

    } catch (error) {
        alert("No se pudo guardar el cultivo.");
    }
});

async function actualizarDashboard() {
    const cultivos = await obtenerCultivos();
    const fotos = await obtenerFotografias();

    document.getElementById("totalCultivos").textContent = cultivos.length;
    document.getElementById("totalFotos").textContent = fotos.length;

    const list = document.getElementById("cropList");
    const recent = document.getElementById("recentActivity");

    list.innerHTML = "";
    recent.innerHTML = "";

    if (cultivos.length === 0) {
        list.textContent = "No hay cultivos registrados.";
        recent.textContent = "Aún no hay cultivos registrados.";
        return;
    }

    cultivos.forEach(cultivo => {
        const item = document.createElement("div");
        item.className = "panel";

        const title = document.createElement("h3");
        title.textContent = cultivo.nombre;

        const area = document.createElement("p");
        area.textContent = `Área: ${cultivo.area} hectáreas`;

        const description = document.createElement("p");
        description.textContent = cultivo.descripcion || "Sin descripción";

        item.append(title, area, description);
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
    } catch (error) {
        console.error("Error inicializando AgroTech:", error);
    }
});

if ("serviceWorker" in navigator) {
    window.addEventListener("load", async () => {
        try {
            await navigator.serviceWorker.register("./sw.js");
            console.log("Service Worker registrado correctamente.");
        } catch (error) {
            console.error("Error registrando Service Worker:", error);
        }
    });
}
