// Importar Supabase desde CDN
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

// Configuración de Supabase
const SUPABASE_URL = "https://zlsweremfwlrnkjnpnoj.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpsc3dlcmVtZndscm5ram5wbm9qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY3Nzk1NDQsImV4cCI6MjA1MjM1NTU0NH0.dqnPO5OajQlxxt5gze_uiJk3xDifbNqXtgMP_P4gRR4"; // Usa una clave segura
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

let myChart = null; // Para evitar superposiciones de gráficos

// Función para obtener y procesar los datos
async function obtenerDatos() {
    const { data, error } = await supabase.from('produccion').select('*');

    if (error) {
        console.error('Error al obtener los datos:', error);
        return;
    }

    console.log("Datos obtenidos de Supabase:", data);

    if (!data || data.length === 0) {
        console.warn("No se recibieron datos desde Supabase.");
        return;
    }

    console.log("Primer registro de Supabase:", data[0]); // Para verificar las claves correctas

    // Filtrar y procesar los datos
    const procedimientosInteres = ['GASTRODUODENOSCOPIA CDAV', 'COLONOSCOPIA CDAV'];
    const df = data
        .map(row => ({
            procedimiento: row["nombre del procedimiento"] || row["Nombre del procedimiento"],
            sala: row["sala de adquisición"] || row["Sala de adquisición"]
        }))
        .filter(row => procedimientosInteres.includes(row.procedimiento) && row.sala); // Filtrar nulos

    console.log("Datos filtrados (con sala de adquisición):", df);

    if (df.length === 0) {
        console.warn("No hay datos para los procedimientos seleccionados.");
        return;
    }

    // Agrupar por sala y procedimiento
    const datosAgrupados = df.reduce((acc, row) => {
        const { sala, procedimiento } = row;

        if (!acc[sala]) {
            acc[sala] = { 'GASTRODUODENOSCOPIA CDAV': 0, 'COLONOSCOPIA CDAV': 0 };
        }

        acc[sala][procedimiento] += 1;
        return acc;
    }, {});

    console.log("Datos agrupados por sala:", datosAgrupados);

    // Convertir a arrays para Chart.js
    const salas = Object.keys(datosAgrupados);
    const gastroduodenoscopia = salas.map(sala => datosAgrupados[sala]['GASTRODUODENOSCOPIA CDAV'] || 0);
    const colonoscopia = salas.map(sala => datosAgrupados[sala]['COLONOSCOPIA CDAV'] || 0);

    console.log("Salas:", salas);
    console.log("Datos GASTRODUODENOSCOPIA CDAV:", gastroduodenoscopia);
    console.log("Datos COLONOSCOPIA CDAV:", colonoscopia);

    // Graficar los datos
    if (salas.length === 0) {
        console.warn("No hay datos para graficar.");
        return;
    }

    graficarDatos(salas, gastroduodenoscopia, colonoscopia);
}

// Función para graficar los datos con Chart.js
function graficarDatos(salas, gastroduodenoscopia, colonoscopia) {
    const ctx = document.getElementById('myChart').getContext('2d');

    if (myChart) {
        myChart.destroy();
    }

    myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: salas,
            datasets: [
                {
                    label: 'GASTRODUODENOSCOPIA CDAV',
                    data: gastroduodenoscopia,
                    backgroundColor: 'rgba(255, 99, 132, 0.5)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 1
                },
                {
                    label: 'COLONOSCOPIA CDAV',
                    data: colonoscopia,
                    backgroundColor: 'rgba(54, 162, 235, 0.5)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Salas de Adquisición'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Número de Procedimientos'
                    },
                    beginAtZero: true
                }
            }
        }
    });
}

// Iniciar la obtención de datos al cargar la página
document.addEventListener('DOMContentLoaded', obtenerDatos);
