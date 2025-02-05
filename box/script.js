// Importar Supabase desde CDN
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

// Configuración de Supabase
const SUPABASE_URL = "https://zlsweremfwlrnkjnpnoj.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpsc3dlcmVtZndscm5ram5wbm9qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY3Nzk1NDQsImV4cCI6MjA1MjM1NTU0NH0.dqnPO5OajQlxxt5gze_uiJk3xDifbNqXtgMP_P4gRR4"; // Usa una clave segura
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

let charts = {}; // Almacena los gráficos para evitar superposiciones

// Función para convertir fechas de 'DD-MMM-YYYY' a un objeto Date
function parseFecha(fechaStr) {
    if (!fechaStr || typeof fechaStr !== "string") {
        return null;
    }

    fechaStr = fechaStr.trim();
    const meses = { 'ene': 0, 'feb': 1, 'mar': 2, 'abr': 3, 'may': 4, 'jun': 5,
                    'jul': 6, 'ago': 7, 'sep': 8, 'oct': 9, 'nov': 10, 'dic': 11 };

    const match = fechaStr.match(/^(\d{2})-([a-zA-Z]{3})-(\d{4})$/);
    if (!match) return null;

    const [, dia, mes, año] = match;
    const mesIndex = meses[mes.toLowerCase()];
    if (mesIndex === undefined) return null;

    return new Date(parseInt(año, 10), mesIndex, parseInt(dia, 10));
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

    // Procesar los datos
    const df = data.map(row => ({
        fecha: parseFecha(row["Fecha del procedimiento programado"]),
        sala: row["sala de adquisición"],
        procedimiento: row["nombre del procedimiento"]
    })).filter(row => row.fecha !== null && row.sala && row.procedimiento);

    console.log("Datos procesados:", df);

    // Filtrar los procedimientos relevantes
    const procedimientosInteres = ['GASTRODUODENOSCOPIA CDAV', 'COLONOSCOPIA CDAV'];
    const dfFiltrado = df.filter(row => procedimientosInteres.includes(row.procedimiento));

    console.log("Datos filtrados:", dfFiltrado);

    if (dfFiltrado.length === 0) {
        console.warn("No hay datos para los procedimientos seleccionados.");
        return;
    }

    // Agrupar datos por sala y semana
    const datosAgrupados = dfFiltrado.reduce((acc, row) => {
        const semana = getWeek(row.fecha);
        const sala = row.sala;

        if (!acc[sala]) acc[sala] = {};
        if (!acc[sala][semana]) acc[sala][semana] = { 'GASTRODUODENOSCOPIA CDAV': 0, 'COLONOSCOPIA CDAV': 0 };

        acc[sala][semana][row.procedimiento] += 1;
        return acc;
    }, {});

    console.log("Datos agrupados por sala y semana:", datosAgrupados);

    // Crear gráficos por cada sala
    Object.keys(datosAgrupados).forEach(sala => {
        const semanas = Object.keys(datosAgrupados[sala]).sort((a, b) => a - b);
        const gastroduodenoscopia = semanas.map(semana => datosAgrupados[sala][semana]['GASTRODUODENOSCOPIA CDAV'] || 0);
        const colonoscopia = semanas.map(semana => datosAgrupados[sala][semana]['COLONOSCOPIA CDAV'] || 0);

        crearGrafico(sala, semanas, gastroduodenoscopia, colonoscopia);
    });
}

// Función para crear gráficos en Chart.js
function crearGrafico(sala, semanas, gastroduodenoscopia, colonoscopia) {
    const container = document.getElementById('charts-container');

    // Crear un nuevo contenedor para el gráfico si no existe
    let chartWrapper = document.getElementById(`chart-wrapper-${sala}`);
    if (!chartWrapper) {
        chartWrapper = document.createElement('div');
        chartWrapper.className = "chart-wrapper";
        chartWrapper.id = `chart-wrapper-${sala}`;
        
        const canvas = document.createElement('canvas');
        canvas.id = `chart-${sala}`;
        chartWrapper.appendChild(canvas);
        container.appendChild(chartWrapper);
    }

    const ctx = document.getElementById(`chart-${sala}`).getContext('2d');

    if (charts[sala]) {
        charts[sala].destroy();
    }

    charts[sala] = new Chart(ctx, {
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
                x: { title: { display: true, text: 'Semana del Año' } },
                y: { title: { display: true, text: 'Número de Procedimientos' }, beginAtZero: true }
            }
        }
    });
}

// Iniciar la obtención de datos al cargar la página
document.addEventListener('DOMContentLoaded', obtenerDatos);

