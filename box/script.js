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
    return isNaN(fecha.getTime()) ? null : fecha;
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

    const df = data.map(row => {
        return {
            fecha: parseFecha(row["Fecha del procedimiento programado"] || row["fecha del procedimiento programado"]),
            procedimiento: row["nombre del procedimiento"] || row["Nombre del procedimiento"],
            sala: row["sala"] || "Desconocida"
        };
    }).filter(row => row.fecha !== null && row.procedimiento);

    console.log("Datos procesados:", df);

    // Agrupar por sala y semana
    const datosAgrupados = {};
    df.forEach(({ fecha, procedimiento, sala }) => {
        const semana = getWeek(fecha);
        if (!datosAgrupados[sala]) datosAgrupados[sala] = {};
        if (!datosAgrupados[sala][semana]) datosAgrupados[sala][semana] = {};
        if (!datosAgrupados[sala][semana][procedimiento]) datosAgrupados[sala][semana][procedimiento] = 0;
        datosAgrupados[sala][semana][procedimiento] += 1;
    });

    console.log("Datos agrupados por sala y semana:", datosAgrupados);
    graficarDatos(datosAgrupados);
}

// Función para obtener el número de semana del año
function getWeek(date) {
    const oneJan = new Date(date.getFullYear(), 0, 1);
    const numberOfDays = Math.floor((date - oneJan) / (24 * 60 * 60 * 1000));
    return Math.ceil((numberOfDays + oneJan.getDay() + 1) / 7);
}

// Función para graficar datos
function graficarDatos(datosAgrupados) {
    const canvas = document.getElementById('myChart');
    if (!canvas) {
        console.error("No se encontró el canvas con id 'myChart'");
        return;
    }
    const ctx = canvas.getContext('2d');
    if (myChart) myChart.destroy();

    const datasets = [];
    Object.keys(datosAgrupados).forEach(sala => {
        Object.keys(datosAgrupados[sala]).forEach(semana => {
            Object.keys(datosAgrupados[sala][semana]).forEach(procedimiento => {
                datasets.push({
                    label: `${procedimiento} - ${sala}`,
                    data: Object.keys(datosAgrupados[sala]).map(sem => datosAgrupados[sala][sem][procedimiento] || 0),
                    borderColor: `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 1)`,
                    fill: false,
                    borderWidth: 2
                });
            });
        });
    });

    myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: Object.keys(datosAgrupados[Object.keys(datosAgrupados)[0]] || {}),
            datasets
        },
        options: {
            responsive: true,
            scales: {
                x: { title: { display: true, text: 'Semana del Año' } },
                y: { title: { display: true, text: 'Número de Procedimientos' }, beginAtZero: true }
            }
        }
    });
}

document.addEventListener('DOMContentLoaded', obtenerDatos);
