// Importar Supabase desde CDN
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

// Configuración de Supabase
const SUPABASE_URL = "https://zlsweremfwlrnkjnpnoj.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpsc3dlcmVtZndscm5ram5wbm9qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY3Nzk1NDQsImV4cCI6MjA1MjM1NTU0NH0.dqnPO5OajQlxxt5gze_uiJk3xDifbNqXtgMP_P4gRR4"; // Usa una clave segura
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

let myChart = null; // Para evitar superposiciones de gráficos

// Función para convertir fecha de formato "04-feb-2025" a Date()
function parseFecha(fechaStr) {
    if (!fechaStr) return null;
    const meses = {
        "ene": 0, "feb": 1, "mar": 2, "abr": 3, "may": 4, "jun": 5,
        "jul": 6, "ago": 7, "sep": 8, "oct": 9, "nov": 10, "dic": 11
    };

    const partes = fechaStr.split("-");
    if (partes.length !== 3) return null;

    const dia = parseInt(partes[0], 10);
    const mes = meses[partes[1].toLowerCase()];
    const anio = parseInt(partes[2], 10);

    if (isNaN(dia) || isNaN(mes) || isNaN(anio)) return null;

    return new Date(anio, mes, dia);
}

// Función para obtener el número de semana del año
function getWeek(date) {
    const oneJan = new Date(date.getFullYear(), 0, 1);
    const numberOfDays = Math.floor((date - oneJan) / (24 * 60 * 60 * 1000));
    return Math.ceil((numberOfDays + oneJan.getDay() + 1) / 7);
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

    // Filtrar y procesar los datos
    const procedimientosInteres = ['GASTRODUODENOSCOPIA CDAV', 'COLONOSCOPIA CDAV'];
    const df = data
        .map(row => ({
            procedimiento: row["nombre del procedimiento"] || row["Nombre del procedimiento"],
            sala: row["sala de adquisición"] || row["Sala de adquisición"],
            fecha: parseFecha(row["fecha del procedimiento programado"] || row["Fecha del procedimiento programado"])
        }))
        .filter(row => row.procedimiento && procedimientosInteres.includes(row.procedimiento) && row.sala && row.fecha); // Filtrar valores nulos

    console.log("Datos filtrados:", df);

    if (df.length === 0) {
        console.warn("No hay datos válidos para graficar.");
        return;
    }

    // Agrupar por semana y sala
    const datosAgrupados = df.reduce((acc, row) => {
        const semana = getWeek(row.fecha);
        const sala = row.sala;
        const procedimiento = row.procedimiento;

        if (!acc[semana]) acc[semana] = {};
        if (!acc[semana][sala]) acc[semana][sala] = { 'GASTRODUODENOSCOPIA CDAV': 0, 'COLONOSCOPIA CDAV': 0 };

        acc[semana][sala][procedimiento] += 1;
        return acc;
    }, {});

    console.log("Datos agrupados por semana y sala:", datosAgrupados);

    // Extraer semanas y salas únicas
    const semanas = Object.keys(datosAgrupados).sort((a, b) => a - b);
    const salas = [...new Set(df.map(row => row.sala))]; // Salas únicas

    // Construir dataset para cada sala/procedimiento
    const datasets = salas.flatMap(sala => [
        {
            label: `GASTRODUODENOSCOPIA CDAV - ${sala}`,
            data: semanas.map(semana => datosAgrupados[semana]?.[sala]?.['GASTRODUODENOSCOPIA CDAV'] || 0),
            borderColor: 'rgba(255, 99, 132, 1)',
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            borderWidth: 2
        },
        {
            label: `COLONOSCOPIA CDAV - ${sala}`,
            data: semanas.map(semana => datosAgrupados[semana]?.[sala]?.['COLONOSCOPIA CDAV'] || 0),
            borderColor: 'rgba(54, 162, 235, 1)',
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            borderWidth: 2
        }
    ]);

    console.log("Semanas:", semanas);
    console.log("Datasets para graficar:", datasets);

    if (semanas.length === 0) {
        console.warn("No hay datos para graficar.");
        return;
    }

    // Graficar los datos
    graficarDatos(semanas, datasets);
}

// Función para graficar los datos con Chart.js
function graficarDatos(semanas, datasets) {
    const ctx = document.getElementById('myChart').getContext('2d');

    if (myChart) {
        myChart.destroy();
    }

    myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: semanas,
            datasets: datasets
        },
        options: {
            responsive: true,
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
