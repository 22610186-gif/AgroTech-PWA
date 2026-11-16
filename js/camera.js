
const video = document.getElementById("cameraPreview");
const canvas = document.getElementById("photoCanvas");

let cameraStream = null;

document.getElementById("startCamera").addEventListener("click", async () => {
    try {
        cameraStream = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: { ideal: "environment" }
            },
            audio: false
        });

        video.srcObject = cameraStream;

    } catch (error) {
        alert("No se pudo activar la cámara: " + error.message);
    }
});

document.getElementById("takePhoto").addEventListener("click", async () => {
    if (!cameraStream) {
        alert("Primero activa la cámara.");
        return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext("2d");
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(async (blob) => {
        if (!blob) return;

        try {
            await guardarFotografia(blob);
            await actualizarDashboard();
            mostrarGaleria();

            alert("Fotografía guardada correctamente.");
        } catch (error) {
            alert("Error al guardar la fotografía.");
        }
    }, "image/jpeg", 0.85);
});

async function mostrarGaleria() {
    const gallery = document.getElementById("photoGallery");
    const photos = await obtenerFotografias();

    gallery.innerHTML = "";

    photos.forEach(photo => {
        const img = document.createElement("img");
        img.src = URL.createObjectURL(photo.imagen);
        img.alt = "Fotografía de cultivo";
        gallery.appendChild(img);
    });
}
