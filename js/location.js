
document.getElementById("getLocation").addEventListener("click", () => {

    const result = document.getElementById("locationResult");

    if (!navigator.geolocation) {
        result.textContent = "Tu dispositivo no admite geolocalización.";
        return;
    }

    result.textContent = "Obteniendo ubicación...";

    navigator.geolocation.getCurrentPosition(
        (position) => {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;

            result.innerHTML = `
                <h3>Ubicación obtenida</h3>
                <p>Latitud: ${latitude}</p>
                <p>Longitud: ${longitude}</p>
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
