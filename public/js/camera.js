
const video = document.getElementById("cameraPreview");
const canvas = document.getElementById("photoCanvas");

let cameraStream = null;

document.getElementById("startCamera").addEventListener("click", async () => {
    try {
        cameraStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: { ideal: "environment" } },
            audio: false
        });

        video.srcObject = cameraStream;
        await video.play();

        alert("Cámara activada correctamente.");

    } catch (error) {
        console.error("Error de cámara:", error);
        alert("No se pudo activar la cámara: " + error.message);
    }
});

document.getElementById("takePhoto").addEventListener("click", async () => {
    if (!cameraStream || video.videoWidth === 0) {
        alert("Primero activa la cámara y espera a que aparezca la imagen.");
        return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext("2d");
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    try {
        const blob = await new Promise((resolve, reject) => {
            canvas.toBlob(result => {
                if (result) resolve(result);
                else reject(new Error("No se pudo generar la fotografía."));
            }, "image/jpeg", 0.85);
        });

        await guardarFotografia(blob);
        await actualizarDashboard();
        await mostrarGaleria();

        alert("¡Fotografía guardada correctamente!");

    } catch (error) {
        console.error("Error guardando fotografía:", error);
        alert("No se pudo guardar la fotografía: " + error.message);
    }
});

async function mostrarGaleria() {
    const gallery = document.getElementById("photoGallery");
    const photos = await obtenerFotografias();

    gallery.innerHTML = "";

    if (photos.length === 0) {
        gallery.innerHTML = "<p>No hay fotos capturadas.</p>";
        return;
    }

    photos.forEach(photo => {
        const card = document.createElement("div");
        card.className = "photo-item";

        const img = document.createElement("img");
        img.src = URL.createObjectURL(photo.imagen);
        img.alt = "Fotografía de cultivo";

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.textContent = "Eliminar";
        deleteButton.className = "secondary-btn";
        deleteButton.addEventListener("click", async () => {
            const confirmar = confirm("¿Deseas eliminar esta foto?");
            if (!confirmar) return;

            await eliminarFotografia(photo.id);
            await actualizarDashboard();
            await mostrarGaleria();
        });

        card.appendChild(img);
        card.appendChild(deleteButton);
        gallery.appendChild(card);
    });
}
