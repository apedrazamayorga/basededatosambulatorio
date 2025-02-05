// Importar Supabase desde CDN
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

// Configuración de Supabase
const SUPABASE_URL = "https://zlsweremfwlrnkjnpnoj.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpsc3dlcmVtZndscm5ram5wbm9qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY3Nzk1NDQsImV4cCI6MjA1MjM1NTU0NH0.dqnPO5OajQlxxt5gze_uiJk3xDifbNqXtgMP_P4gRR4"; // Usa una clave segura
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

let charts = {}; // Para almacenar múltiples gráficos

// Función para obtener y procesar los datos
async function obtenerDatos() {
    const { data, error } = await supabase.from('produccion').select('*');
    
    if (error) {
        console.error('Error al obtener los datos:', error);
        return;
    }
    
    console.log("Datos obtenidos de Supabase:", data);

    // Procesar los datos
    const df = data.map(row => ({
        fecha: parseFecha(row["Fecha del procedimiento programado"]),
        sala: row["sala de adquisición"],
        procedimiento: row["nombre del procedimiento"]
    })).filter(row => row.fecha !== null && row.sala && row.procedimiento);

    // Filtrar los procedimientos relevantes
    const procedimientosInteres = ['GASTRODUODENOSCOPIA CDAV', 'COLONOSCOPIA CDAV'];
    const dfFiltrado = df.filter(row => procedimientosInteres.includes(row.procedimiento));

    // Agrupar por semana, sala y procedimiento
    const datosAgrupados = dfFiltrado.reduce((acc, row) => {
        const semana = getWeek(row.fecha);
        const sala = row.sala;
        const procedimiento = row.procedimiento;

        if (!acc[sala]) {
            acc[sala] = {};
        }
        if (!acc[sala][semana]) {
            acc[sala][semana] = { 'GASTRODUODENOSCOPIA CDAV': 0, 'COLONOSCOPIA CDAV': 0 };
        }
        acc[sala][semana][procedimiento] += 1;
        return acc;
    }, {});

    // Crear gráficos para cada sala
    Object.keys(datosAgrupados).forEach(sala => {
        const semanas = Object.keys(datosAgrupados[sala]).sort((a, b) => a - b);
        const gastroduodenoscopia = semanas.map(semana => datosAgrupados[sala][semana]['GASTRODUODENOSCOPIA CDAV'] || 0);
        const colonoscopia = semanas.map(semana => datosAgrupados[sala][semana]['COLONOSCOPIA CDAV'] || 0);

        crearGrafico(sala, semanas, gastroduodenoscopia, colonoscopia);
    });
}

// Función para convertir fecha de formato "dd-mmm-yyyy" a Date
function parseFecha(fechaStr) {
    if (!fechaStr) return null;
    const meses = {"ene": 0, "feb": 1, "mar": 2, "abr": 3, "may": 4, "jun": 5, "jul": 6, "ago": 7, "sep": 8, "oct": 9, "nov": 10, "dic": 11};
    const partes = fechaStr.split('-');
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

// Función para crear gráficos separados por sala
function crearGrafico(sala, semanas, gastroduodenoscopia, colonoscopia) {
    const container = document.getElementById('charts-container');
    const canvas = document.createElement('canvas');
    canvas.id = `chart-${sala}`;
    container.appendChild(canvas);
    
    const ctx = canvas.getContext('2d');
    
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
            plugins: {
                title: {
                    display: true,
                    text: `Sala: ${sala}`
                }
            },
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
