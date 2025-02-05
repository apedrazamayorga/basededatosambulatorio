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

    const [, dia, mesTexto, año] = match;
    const mesIndex = meses[mesTexto.toLowerCase()];

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

    console.log("Primer registro de Supabase:", data[0]);

    // Procesar los datos para extraer las salas y procedimientos
    const df = data.map(row => ({
        sala: row["Sala de Adquisición"] || row["sala de adquisición"],
        procedimiento: row["nombre del procedimiento"] || row["Nombre del procedimiento"]
    })).filter(row => row.sala && row.procedimiento); // Filtrar datos inválidos

    console.log("Datos después de conversión:", df);

    // Filtrar los procedimientos de interés
    const procedimientosInteres = ['GASTRODUODENOSCOPIA CDAV', 'COLONOSCOPIA CDAV'];
    const dfFiltrado = df.filter(row => procedimientosInteres.includes(row.procedimiento));

    console.log("Datos filtrados:", dfFiltrado);

    if (dfFiltrado.length === 0) {
        console.warn("No hay datos para los procedimientos seleccionados.");
        return;
    }

    // Agrupar por "Sala de Adquisición" y "Nombre del Procedimiento"
    const datosAgrupados = dfFiltrado.reduce((acc, row) => {
        if (!acc[row.sala]) {
            acc[row.sala] = { 'GASTRODUODENOSCOPIA CDAV': 0, 'COLONOSCOPIA CDAV': 0 };
        }
        acc[row.sala][row.procedimiento] += 1;
        return acc;
    }, {});

    console.log("Datos agrupados por Sala de Adquisición:", datosAgrupados);

    // Convertir a formato de Chart.js
    const salas = Object.keys(datosAgrupados);
    const gastroduodenoscopia = salas.map(sala => datosAgrupados[sala]['GASTRODUODENOSCOPIA CDAV'] || 0);
    const colonoscopia = salas.map(sala => datosAgrupados[sala]['COLONOSCOPIA CDAV'] || 0);

    console.log("Salas:", salas);
    console.log("Datos GASTRODUODENOSCOPIA CDAV:", gastroduodenoscopia);
    console.log("Datos COLONOSCOPIA CDAV:", colonoscopia);

    // Graficar los datos
    graficarDatos(salas, gastroduodenoscopia, colonoscopia);
}

// Función para graficar los datos como barras agrupadas
function graficarDatos(salas, gastroduodenoscopia, colonoscopia) {
    console.log("Intentando graficar...");
    console.log("Salas:", salas);
    console.log("GASTRODUODENOSCOPIA CDAV:", gastroduodenoscopia);
    console.log("COLONOSCOPIA CDAV:", colonoscopia);

    if (salas.length === 0 || (gastroduodenoscopia.length === 0 && colonoscopia.length === 0)) {
        console.warn("No hay datos suficientes para graficar.");
        return;
    }

    const canvas = document.getElementById('myChart');
    if (!canvas) {
        console.error("No se encontró el <canvas> con id 'myChart'.");
        return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
        console.error("No se pudo obtener el contexto 2D del canvas.");
        return;
    }

    if (myChart) {
        myChart.destroy();
    }

    myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: salas, // Eje Y: "Sala de Adquisición"
            datasets: [
                {
                    label: 'GASTRODUODENOSCOPIA CDAV',
                    data: gastroduodenoscopia,
                    backgroundColor: 'rgba(255, 99, 132, 0.6)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 1
                },
                {
                    label: 'COLONOSCOPIA CDAV',
                    data: colonoscopia,
                    backgroundColor: 'rgba(54, 162, 235, 0.6)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            indexAxis: 'y', // Hace que el gráfico sea horizontal
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Número de Procedimientos'
                    },
                    beginAtZero: true
                },
                y: {
                    title: {
                        display: true,
                        text: 'Sala de Adquisición'
                    }
                }
            }
        }
    });

    console.log("Gráfico generado exitosamente.");
}

// Iniciar la obtención de datos al cargar la página
document.addEventListener('DOMContentLoaded', obtenerDatos);
