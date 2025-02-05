// Importar Supabase desde CDN
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

// Configuración de Supabase
const SUPABASE_URL = "https://zlsweremfwlrnkjnpnoj.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpsc3dlcmVtZndscm5ram5wbm9qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY3Nzk1NDQsImV4cCI6MjA1MjM1NTU0NH0.dqnPO5OajQlxxt5gze_uiJk3xDifbNqXtgMP_P4gRR4"; // Usa una clave segura
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Función para convertir fechas de 'DD-MMM-YYYY' a objeto Date
function parseFecha(fechaStr) {
    if (!fechaStr || typeof fechaStr !== "string") return null;
    fechaStr = fechaStr.trim();
    const meses = { 'ene': 0, 'feb': 1, 'mar': 2, 'abr': 3, 'may': 4, 'jun': 5,
                    'jul': 6, 'ago': 7, 'sep': 8, 'oct': 9, 'nov': 10, 'dic': 11 };
    const match = fechaStr.match(/^(\d{2})-([a-zA-Z]{3})-(\d{4})$/);
    if (!match) return null;
    const [, dia, mes, año] = match;
    const mesIndex = meses[mes.toLowerCase()];
    return new Date(parseInt(año, 10), mesIndex, parseInt(dia, 10));
}

// Obtener datos desde Supabase y organizarlos por sala y semana
async function obtenerDatos() {
    const { data, error } = await supabase.from('produccion').select('*');
    if (error || !data || data.length === 0) return;

    const df = data.map(row => ({
        fecha: parseFecha(row["Fecha del procedimiento programado"] || row["fecha del procedimiento programado"]),
        procedimiento: row["nombre del procedimiento"] || row["Nombre del procedimiento"],
        sala: row["sala de adquisición"] || row["Sala de adquisición"]
    })).filter(row => row.fecha !== null && row.procedimiento && row.sala);

    const procedimientosInteres = ['GASTRODUODENOSCOPIA CDAV', 'COLONOSCOPIA CDAV'];
    const dfFiltrado = df.filter(row => procedimientosInteres.includes(row.procedimiento));

    const datosPorSala = {};
    dfFiltrado.forEach(row => {
        const semana = getWeek(row.fecha);
        const sala = row.sala;
        if (!datosPorSala[sala]) datosPorSala[sala] = {};
        if (!datosPorSala[sala][semana]) {
            datosPorSala[sala][semana] = { 'GASTRODUODENOSCOPIA CDAV': 0, 'COLONOSCOPIA CDAV': 0 };
        }
        datosPorSala[sala][semana][row.procedimiento] += 1;
    });

    const datosFinales = {};
    Object.entries(datosPorSala).forEach(([sala, semanasObj]) => {
        const semanas = Object.keys(semanasObj).sort((a, b) => a - b);
        datosFinales[sala] = {
            semanas,
            gastroduodenoscopia: semanas.map(semana => semanasObj[semana]['GASTRODUODENOSCOPIA CDAV'] || 0),
            colonoscopia: semanas.map(semana => semanasObj[semana]['COLONOSCOPIA CDAV'] || 0)
        };
    });

    graficarDatos(datosFinales);
}

// Obtener el número de semana del año
function getWeek(date) {
    const oneJan = new Date(date.getFullYear(), 0, 1);
    const numberOfDays = Math.floor((date - oneJan) / (24 * 60 * 60 * 1000));
    return Math.ceil((numberOfDays + oneJan.getDay() + 1) / 7);
}

// Crear dinámicamente gráficos por sala
function graficarDatos(datosPorSala) {
    const container = document.getElementById('charts-container');
    container.innerHTML = '';

    Object.entries(datosPorSala).forEach(([sala, datos]) => {
        const canvasId = `chart-${sala.replace(/\s+/g, '-')}`;
        const chartWrapper = document.createElement('div');
        chartWrapper.classList.add('chart-wrapper');

        const titulo = document.createElement('h2');
        titulo.textContent = `Sala: ${sala}`;
        chartWrapper.appendChild(titulo);

        const canvas = document.createElement('canvas');
        canvas.id = canvasId;
        chartWrapper.appendChild(canvas);
        container.appendChild(chartWrapper);

        const ctx = canvas.getContext('2d');
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: datos.semanas,
                datasets: [
                    {
                        label: 'GASTRODUODENOSCOPIA CDAV',
                        data: datos.gastroduodenoscopia,
                        borderColor: 'rgba(255, 99, 132, 1)',
                        backgroundColor: 'rgba(255, 99, 132, 0.2)',
                        borderWidth: 2
                    },
                    {
                        label: 'COLONOSCOPIA CDAV',
                        data: datos.colonoscopia,
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
    });
}

document.addEventListener('DOMContentLoaded', obtenerDatos);
