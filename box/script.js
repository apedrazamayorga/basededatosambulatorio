// Importar Supabase desde CDN
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

// Configuración de Supabase
const SUPABASE_URL = "https://zlsweremfwlrnkjnpnoj.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpsc3dlcmVtZndscm5ram5wbm9qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY3Nzk1NDQsImV4cCI6MjA1MjM1NTU0NH0.dqnPO5OajQlxxt5gze_uiJk3xDifbNqXtgMP_P4gRR4";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

let myChart = null; // Para evitar superposiciones de gráficos

// Función para convertir fechas de 'DD-MMM-YYYY' a un objeto Date
function parseFecha(fechaStr) {
    if (!fechaStr || typeof fechaStr !== "string") return null;
    
    fechaStr = fechaStr.trim().toLowerCase();
    const meses = { 'ene': 0, 'feb': 1, 'mar': 2, 'abr': 3, 'may': 4, 'jun': 5,
        'jul': 6, 'ago': 7, 'sep': 8, 'oct': 9, 'nov': 10, 'dic': 11 };
    
    const match = fechaStr.match(/^(\d{2})-([a-z]{3})-(\d{4})$/);
    if (!match) return null;
    
    const [, dia, mesTexto, año] = match;
    const mesIndex = meses[mesTexto];
    if (mesIndex === undefined) return null;
    
    return new Date(parseInt(año, 10), mesIndex, parseInt(dia, 10));
}

// Función para obtener y procesar los datos
tasync function obtenerDatos() {
    const { data, error } = await supabase.from('produccion').select('*');
    if (error || !data || data.length === 0) return;

    const df = data.map(row => ({
        fecha: parseFecha(row["Fecha del procedimiento programado"]?.trim() || row["fecha del procedimiento programado"]?.trim()),
        procedimiento: row["Nombre del procedimiento"]?.trim() || row["nombre del procedimiento"]?.trim(),
        sala: row["Sala de adquisición"]?.trim()
    })).filter(row => row.fecha !== null && row.procedimiento && row.sala);

    const procedimientosInteres = ['GASTRODUODENOSCOPIA CDAV', 'COLONOSCOPIA CDAV'];
    const dfFiltrado = df.filter(row => procedimientosInteres.includes(row.procedimiento));
    if (dfFiltrado.length === 0) return;

    const datosAgrupados = dfFiltrado.reduce((acc, row) => {
        if (!acc[row.sala]) acc[row.sala] = { 'GASTRODUODENOSCOPIA CDAV': 0, 'COLONOSCOPIA CDAV': 0 };
        acc[row.sala][row.procedimiento]++;
        return acc;
    }, {});

    const salas = Object.keys(datosAgrupados);
    const gastroduodenoscopia = salas.map(sala => datosAgrupados[sala]['GASTRODUODENOSCOPIA CDAV'] || 0);
    const colonoscopia = salas.map(sala => datosAgrupados[sala]['COLONOSCOPIA CDAV'] || 0);

    graficarDatos(salas, gastroduodenoscopia, colonoscopia);
}

// Función para graficar los datos
function graficarDatos(salas, gastroduodenoscopia, colonoscopia) {
    const canvas = document.getElementById("myChart");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (myChart) myChart.destroy();

    myChart = new Chart(ctx, {
        type: "bar",
        data: {
            labels: salas,
            datasets: [
                {
                    label: "GASTRODUODENOSCOPIA CDAV",
                    data: gastroduodenoscopia,
                    backgroundColor: "rgba(54, 162, 235, 0.5)",
                    borderColor: "rgba(54, 162, 235, 1)",
                    borderWidth: 1,
                },
                {
                    label: "COLONOSCOPIA CDAV",
                    data: colonoscopia,
                    backgroundColor: "rgba(255, 99, 132, 0.5)",
                    borderColor: "rgba(255, 99, 132, 1)",
                    borderWidth: 1,
                },
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { color: "black" },
                },
                x: {
                    ticks: { color: "black" },
                },
            },
            plugins: {
                legend: {
                    labels: {
                        color: "black",
                        font: { family: "Arial", size: 14 },
                    },
                },
            },
        },
    });
}

document.addEventListener("DOMContentLoaded", obtenerDatos);

