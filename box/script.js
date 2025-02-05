// Importar Supabase desde CDN
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

// Configuración de Supabase
const SUPABASE_URL = "https://zlsweremfwlrnkjnpnoj.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpsc3dlcmVtZndscm5ram5wbm9qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY3Nzk1NDQsImV4cCI6MjA1MjM1NTU0NH0.dqnPO5OajQlxxt5gze_uiJk3xDifbNqXtgMP_P4gRR4";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

let myChart = null; // Para evitar superposiciones de gráficos
let datosPorSemana = {}; // Almacenará los datos agrupados por semana

// Función para convertir fechas de 'DD-MMM-YYYY' a Date
function parseFecha(fechaStr) {
    if (!fechaStr || typeof fechaStr !== "string") return null;
    const meses = { 'ene': 0, 'feb': 1, 'mar': 2, 'abr': 3, 'may': 4, 'jun': 5, 'jul': 6, 'ago': 7, 'sep': 8, 'oct': 9, 'nov': 10, 'dic': 11 };
    const match = fechaStr.toLowerCase().trim().match(/^(\d{2})-([a-z]{3})-(\d{4})$/);
    if (!match) return null;
    const [, dia, mesTexto, año] = match;
    const mesIndex = meses[mesTexto];
    return new Date(parseInt(año, 10), mesIndex, parseInt(dia, 10));
}

// Función para obtener y procesar los datos
async function obtenerDatos() {
    const { data, error } = await supabase.from('produccion').select('*');
    if (error || !data || data.length === 0) return;

    const df = data.map(row => ({
        fecha: parseFecha(row["Fecha del procedimiento programado"]?.trim()),
        procedimiento: row["Nombre del procedimiento"]?.trim(),
        sala: row["Sala de adquisición"]?.trim()
    })).filter(row => row.fecha && row.procedimiento && row.sala);

    if (df.length === 0) return;

    // Agrupar por semana
    datosPorSemana = {};
    df.forEach(row => {
        const semana = obtenerSemanaDelAño(row.fecha);
        if (!datosPorSemana[semana]) datosPorSemana[semana] = [];
        datosPorSemana[semana].push(row);
    });

    // Generar lista de semanas en el selector
    actualizarSelectorSemanas(Object.keys(datosPorSemana).sort((a, b) => a - b));

    // Graficar la primera semana por defecto
    graficarSemana(Object.keys(datosPorSemana)[0]);
}

// Función para obtener la semana del año
function obtenerSemanaDelAño(fecha) {
    const primerDiaDelAño = new Date(fecha.getFullYear(), 0, 1);
    const diasPasados = Math.floor((fecha - primerDiaDelAño) / (24 * 60 * 60 * 1000));
    return Math.ceil((diasPasados + primerDiaDelAño.getDay() + 1) / 7);
}

// Función para actualizar el selector de semanas
function actualizarSelectorSemanas(semanas) {
    const selector = document.getElementById("selectorSemana");
    selector.innerHTML = "";
    semanas.forEach(semana => {
        const opcion = document.createElement("option");
        opcion.value = semana;
        opcion.textContent = `Semana ${semana}`;
        selector.appendChild(opcion);
    });

    // Evento para cambiar de semana
    selector.addEventListener("change", (e) => graficarSemana(e.target.value));
}

// Función para graficar una semana específica
function graficarSemana(semana) {
    if (!datosPorSemana[semana]) return;

    const dfFiltrado = datosPorSemana[semana];

    // Agrupar por sala y procedimiento
    const datosAgrupados = {};
    dfFiltrado.forEach(row => {
        if (!datosAgrupados[row.sala]) {
            datosAgrupados[row.sala] = {};
        }
        if (!datosAgrupados[row.sala][row.procedimiento]) {
            datosAgrupados[row.sala][row.procedimiento] = 0;
        }
        datosAgrupados[row.sala][row.procedimiento] += 1;
    });

    const salas = Object.keys(datosAgrupados);
    const procedimientosUnicos = [...new Set(dfFiltrado.map(row => row.procedimiento))];

    // Crear datasets para cada procedimiento
    const datasets = procedimientosUnicos.map(procedimiento => ({
        label: procedimiento,
        data: salas.map(sala => datosAgrupados[sala][procedimiento] || 0),
        backgroundColor: `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 0.5)`,
        borderColor: `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 1)`,
        borderWidth: 1,
    }));

    graficarDatos(salas, datasets);
}

// Función para graficar los datos
function graficarDatos(salas, datasets) {
    const ctx = document.getElementById('myChart')?.getContext('2d');
    if (!ctx) return;

    if (myChart) myChart.destroy();

    myChart = new Chart(ctx, {
        type: "bar",
        data: {
            labels: salas,
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { beginAtZero: true, ticks: { color: "black" } },
                x: { ticks: { color: "black" } },
            },
            plugins: {
                legend: { labels: { color: "black", font: { family: "Arial", size: 14 } } },
            },
        },
    });
}

// Ejecutar la función cuando el DOM esté cargado
document.addEventListener("DOMContentLoaded", () => obtenerDatos());
