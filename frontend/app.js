// =========================
// MAPA COSÍO AGUASCALIENTES
// =========================

const map = L.map('map').setView([22.366, -102.3], 12);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: 'OpenStreetMap'
}).addTo(map);

// GPS
let currentLat = null;
let currentLng = null;

navigator.geolocation.getCurrentPosition(
    (position) => {
        currentLat = position.coords.latitude;
        currentLng = position.coords.longitude;

        L.marker([currentLat, currentLng])
            .addTo(map)
            .bindPopup("Tu ubicación actual")
            .openPopup();

        map.setView([currentLat, currentLng], 14);
    },
    () => {
        alert("Debes permitir acceso a la ubicación GPS");
    }
);

// =========================
// ENVIAR REPORTE
// =========================

async function submitReport() {

    console.log("1. BOTÓN FUNCIONA");

    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const zone = document.getElementById("zone").value;
    const desc = document.getElementById("desc").value;

    console.log("2. DATOS LEÍDOS", name, email, zone, desc);

    try {

        console.log("3. ANTES DE REGISTER");

        const registerData = new FormData();
        registerData.append("name", name);
        registerData.append("email", email);

        const registerResponse = await fetch(
            "https://saac-cosio.onrender.com/register",
            {
                method: "POST",
                body: registerData
            }
        );

        console.log("4. DESPUÉS DE FETCH REGISTER");

        const registerJson = await registerResponse.json();

        console.log("5. RESPONSE REGISTER:", registerJson);

    } catch (error) {

        console.log("ERROR DETECTADO:", error);

        alert("ERROR: " + error.message);
    }
}