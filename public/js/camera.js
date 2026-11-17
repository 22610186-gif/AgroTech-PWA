
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

    photos.forEach(photo => {
        const img = document.createElement("img");

        img.src = URL.createObjectURL(photo.imagen);
        img.alt = "Fotografía de cultivo";

        gallery.appendChild(img);
    });
}
