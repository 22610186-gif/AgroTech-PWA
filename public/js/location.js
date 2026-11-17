
window.ubicacionActual = {
    latitud: null,
    longitud: null
};

window.establecerUbicacionActual = function (latitud, longitud) {
    window.ubicacionActual = { latitud, longitud };
};

document.getElementById("getLocation").addEventListener("click", async () => {

    const result = document.getElementById("locationResult");
    const cropSelector = document.getElementById("cropSelector");
    const cropId = cropSelector ? Number(cropSelector.value) : null;

    if (!navigator.geolocation) {
        result.textContent = "Tu dispositivo no admite geolocalización.";
        return;
    }

    result.textContent = "Obteniendo ubicación...";

    navigator.geolocation.getCurrentPosition(
        async (position) => {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;

            window.establecerUbicacionActual(latitude, longitude);
            const summary = document.getElementById("cropLocationSummary");
            if (summary) {
                summary.textContent = `Lat: ${latitude.toFixed(5)}, Lng: ${longitude.toFixed(5)}`;
            }

            if (cropId) {
                try {
                    await actualizarCultivo(cropId, {
                        latitud: latitude,
                        longitud: longitude
                    });
                    await actualizarDashboard();
                } catch (error) {
                    console.error("Error guardando la ubicación del cultivo:", error);
                }
            }

            result.innerHTML = `
                <h3>Ubicación obtenida</h3>
                <p>Latitud: ${latitude}</p>
                <p>Longitud: ${longitude}</p>
                <div style="margin: 12px 0; border-radius: 12px; overflow: hidden; border: 1px solid #dfe7e1;">
                    <iframe
                        src="https://www.google.com/maps?q=${latitude},${longitude}&z=16&output=embed"
                        width="100%"
                        height="260"
                        style="border:0; display:block;"
                        allowfullscreen
                        loading="lazy"
                        referrerpolicy="no-referrer-when-downgrade">
                    </iframe>
                </div>
                <a href="https://www.google.com/maps?q=${latitude},${longitude}"
                   target="_blank" rel="noopener">
                   Ver en Google Maps
                </a>
            `;

            document.getElementById("locationStatus").textContent = "Registrada";
        },

        (error) => {
            result.textContent = "No se pudo obtener la ubicación: " + error.message;
        },

        {
            enableHighAccuracy: true,
            timeout: 15000
        }
    );
});
