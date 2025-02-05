// Importar Supabase desde CDN
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

// Configuración de Supabase
const SUPABASE_URL = "https://zlsweremfwlrnkjnpnoj.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpsc3dlcmVtZndscm5ram5wbm9qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY3Nzk1NDQsImV4cCI6MjA1MjM1NTU0NH0.dqnPO5OajQlxxt5gze_uiJk3xDifbNqXtgMP_P4gRR4"; // Usa una clave segura
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

let myChart = null; // Para evitar superposiciones de gráficos

// Función para convertir fechas de 'DD-MMM-YYYY' a un objeto Date
function parseFecha(fechaStr) {
    if (!fechaStr || typeof fechaStr !== "string") {
        console.warn("Fecha no válida (vacía o nula):", fechaStr);
        return null;
    }

    fechaStr = fechaStr.trim();
    const meses = { 'ene': 0, 'feb': 1, 'mar': 2, 'abr': 3, 'may': 4, 'jun': 5,
                    'jul': 6, 'ago': 7, 'sep': 8, 'oct': 9, 'nov': 10, 'dic': 11 };

    const regexFecha = /^(\d{2})-([a-zA-Z]{3})-(\d{4})$/;
    const match = fechaStr.match(regexFecha);

    if (!match) {
        console.warn("Formato de fecha incorrecto:", fechaStr);
        return null;
    }

    const [, dia, mes, año] = match;
    const mesIndex = meses[mes.toLowerCase()];

    if (mesIndex === undefined) {
        console.warn("Mes no reconocido en la fecha:", fechaStr);
        return null;
    }

    const fecha = new Date(parseInt(año, 10), mesIndex, parseInt(dia, 10));

    if (isNaN(fecha.getTime())) {
        console.warn("Fecha inválida tras conversión:", fechaStr);
        return null;
    }

    console.log(`Fecha procesada correctamente: ${fechaStr} -> ${fecha}`);
    return fecha;
}

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

    // Mostrar la primera fila para verificar las claves correctas
    console.log("Primer registro de Supabase:", data[0]);

    // Asegurarse de que las claves existen en los registros
    const df = data.map(row => ({
        fecha: parseFecha(row["Fecha del procedimiento programado"] || row["fecha del procedimiento programado"]),
        procedimiento: row["nombre del procedimiento"] || row["Nombre del procedimiento"]
    })).filter(row => row.fecha !== null && row.procedimiento); // Filtrar fechas y procedimientos nulos

    console.log("Datos después de conversión de fechas:", df);

    // Filtrar los procedimientos relevantes
    const procedimientosInteres = ['GASTRODUODENOSCOPIA CDAV', 'COLONOSCOPIA CDAV'];
    const dfFiltrado = df.filter(row => procedimientosInteres.includes(row.procedimiento));

    console.log("Datos filtrados (solo procedimientos de interés):", dfFiltrado);

    if (dfFiltrado.length === 0) {
        console.warn("No hay datos para los procedimientos seleccionados.");
        return;
    }

    // Agrupar por semana y nombre del procedimiento
    const datosAgrupados = dfFiltrado.reduce((acc, row) => {
        const semana = getWeek(row.fecha);
        console.log(`Fecha: ${row.fecha} -> Semana: ${semana}`);
        
        if (!acc[semana]) {
            acc[semana] = { 'GASTRODUODENOSCOPIA CDAV': 0, 'COLONOSCOPIA CDAV': 0 };
        }

        acc[semana][row.procedimiento] += 1;
        return acc;
    }, {});

    console.log("Datos agrupados por semana:", datosAgrupados);

    // Convertir a arrays para Chart.js
    const semanas = Object.keys(datosAgrupados).sort((a, b) => a - b);
    const gastroduodenoscopia = semanas.map(semana => datosAgrupados[semana]['GASTRODUODENOSCOPIA CDAV'] || 0);
    const colonoscopia = semanas.map(semana => datosAgrupados[semana]['COLONOSCOPIA CDAV'] || 0);

    console.log("Semanas:", semanas);
    console.log("Datos GASTRODUODENOSCOPIA CDAV:", gastroduodenoscopia);
    console.log("Datos COLONOSCOPIA CDAV:", colonoscopia);

    // Graficar los datos
    if (semanas.length === 0) {
        console.warn("No hay datos para graficar.");
        return;
    }

    graficarDatos(semanas, gastroduodenoscopia, colonoscopia);
}

// Función para obtener el número de semana del año
function getWeek(date) {
    const oneJan = new Date(date.getFullYear(), 0, 1);
    const numberOfDays = Math.floor((date - oneJan) / (24 * 60 * 60 * 1000));
    return Math.ceil((numberOfDays + oneJan.getDay() + 1) / 7);
}

// Función para graficar los datos con Chart.js
function graficarDatos(semanas, gastroduodenoscopia, colonoscopia) {
    const ctx = document.getElementById('myChart').getContext('2d');

    if (myChart) {
        myChart.destroy();
    }

    myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: semanas,
            datasets: [
                {
                    label: 'GASTRODUODENOSCOPIA CDAV',
                    data: gastroduodenoscopia,
                    borderColor: 'rgba(255, 99, 132, 1)',
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    borderWidth: 2
                },
                {
                    label: 'COLONOSCOPIA CDAV',
                    data: colonoscopia,
                    borderColor: 'rgba(54, 162, 235, 1)',
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    borderWidth: 2
                }
            ]
        },
        options: {
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Semana del Año'
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

