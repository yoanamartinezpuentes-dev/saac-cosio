// =========================
// MAPA COSÍO AGUASCALIENTES
// =========================

const map = L.map('map').setView([22.366, -102.3], 12);

// MAPA OPENSTREETMAP
L.tileLayer(
    'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    {
        attribution: 'OpenStreetMap'
    }
).addTo(map);

// VARIABLES GPS
let currentLat = null;
let currentLng = null;

// OBTENER UBICACIÓN
navigator.geolocation.getCurrentPosition(

    (position) => {

        currentLat = position.coords.latitude;
        currentLng = position.coords.longitude;

        // MARCADOR USUARIO
        L.marker([currentLat, currentLng])
            .addTo(map)
            .bindPopup("Tu ubicación actual")
            .openPopup();

        // CENTRAR MAPA
        map.setView([currentLat, currentLng], 14);

    },

    () => {

        alert(
            "Debes permitir acceso a la ubicación GPS"
        );

    }

);

// =========================
// ENVIAR REPORTE
// =========================

async function submitReport(){

    try{

        // DATOS USUARIO
        const name =
            document.getElementById("name").value;

        const email =
            document.getElementById("email").value;

        const zone =
            document.getElementById("zone").value;

        const desc =
            document.getElementById("desc").value;

        const image =
            document.getElementById("img").files[0];

        // VALIDACIONES
        if(!name || !email || !desc){

            alert(
                "Completa todos los campos"
            );

            return;
        }

        // =========================
        // REGISTRAR USUARIO
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

        const registerJson =
            await registerResponse.json();

        // =========================
        // CREAR REPORTE
        // =========================

        const reportData = new FormData();

        reportData.append(
            "user_id",
            registerJson.user_id
        );

        reportData.append(
            "description",
            desc
        );

        reportData.append(
            "zone",
            zone
        );

        reportData.append(
            "lat",
            currentLat
        );

        reportData.append(
            "lng",
            currentLng
        );

        // IMAGEN
        if(image){

            reportData.append(
                "image",
                image
            );

        }

        const reportResponse = await fetch(

           "https://saac-cosio.onrender.com/report",

            {
                method: "POST",
                body: reportData
            }

        );

        const reportJson =
            await reportResponse.json();

        // MENSAJE
        alert(

            "Reporte enviado correctamente\n\n" +

            "Prioridad asignada: " +

            reportJson.priority

        );

        // LIMPIAR FORMULARIO
        document.getElementById("name").value = "";
        document.getElementById("email").value = "";
        document.getElementById("desc").value = "";
        document.getElementById("img").value = "";

    }

    catch(error){

        console.log(error);

        alert(
            "Error al enviar reporte"
        );

    }

}