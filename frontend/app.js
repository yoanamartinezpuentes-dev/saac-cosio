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
// ENVIAR REPORTE (CORREGIDO)
// =========================

async function submitReport() {

    try {

        const name = document.getElementById("name").value;
        const email = document.getElementById("email").value;
        const zone = document.getElementById("zone").value;
        const desc = document.getElementById("desc").value;
        const image = document.getElementById("img").files[0];

        if (!name || !email || !desc) {
            alert("Completa todos los campos");
            return;
        }

        if (currentLat === null || currentLng === null) {
            alert("Activa la ubicación GPS y recarga la página");
            return;
        }

        // =========================
        // REGISTER
        // =========================
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

        if (!registerResponse.ok) {
            throw new Error("Error en /register: " + registerResponse.status);
        }

        const registerJson = await registerResponse.json();
        console.log("REGISTER RESPONSE:", registerJson);

        // 🔥 aceptar user_id o id
        const userId = registerJson.user_id || registerJson.id;

        if (!userId) {
            throw new Error("El backend no devolvió user_id o id");
        }

        // =========================
        // REPORT
        // =========================
        const reportData = new FormData();

        reportData.append("user_id", userId);
        reportData.append("description", desc);
        reportData.append("zone", zone);
        reportData.append("lat", currentLat);
        reportData.append("lng", currentLng);

        if (image) {
            reportData.append("image", image);
        }

        const reportResponse = await fetch(
            "https://saac-cosio.onrender.com/report",
            {
                method: "POST",
                body: reportData
            }
        );

        if (!reportResponse.ok) {
            throw new Error("Error en /report: " + reportResponse.status);
        }

        const reportJson = await reportResponse.json();

        alert(
            "Reporte enviado correctamente\n\nPrioridad: " +
            reportJson.priority
        );

        // LIMPIAR
        document.getElementById("name").value = "";
        document.getElementById("email").value = "";
        document.getElementById("desc").value = "";
        document.getElementById("img").value = "";

    } catch (error) {
        console.log("ERROR COMPLETO:", error);
        alert("Error al enviar reporte: " + error.message);
    }
}