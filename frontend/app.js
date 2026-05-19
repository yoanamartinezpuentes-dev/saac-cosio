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
       console.log("BOTÓN FUNCIONA");
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
        const registerResponse = await fetch(
            "https://saac-cosio.onrender.com/register",
            {
                method: "POST",
                body: (() => {
                    const fd = new FormData();
                    fd.append("name", name);
                    fd.append("email", email);
                    return fd;
                })()
            }
        );

        if (!registerResponse.ok) {
            throw new Error("Error en /register: " + registerResponse.status);
        }

        let registerJson;
        try {
            registerJson = await registerResponse.json();
        } catch (e) {
            throw new Error("Respuesta inválida en /register (no es JSON)");
        }

        console.log("REGISTER RESPONSE:", registerJson);

        const userId = registerJson.user_id ?? registerJson.id;

        if (!userId) {
            throw new Error("El backend no devolvió user_id ni id");
        }

        // =========================
        // REPORT
        // =========================
        const reportResponse = await fetch(
            "https://saac-cosio.onrender.com/report",
            {
                method: "POST",
                body: (() => {
                    const fd = new FormData();

                    fd.append("user_id", userId);
                    fd.append("description", desc);
                    fd.append("zone", zone);
                    fd.append("lat", currentLat);
                    fd.append("lng", currentLng);

                    if (image) {
                        fd.append("image", image);
                    }

                    return fd;
                })()
            }
        );

        if (!reportResponse.ok) {
            throw new Error("Error en /report: " + reportResponse.status);
        }

        let reportJson;
        try {
            reportJson = await reportResponse.json();
        } catch (e) {
            throw new Error("Respuesta inválida en /report (no es JSON)");
        }

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