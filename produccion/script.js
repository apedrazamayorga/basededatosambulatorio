// Importar Supabase desde CDN
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

// Configuración de Supabase
const SUPABASE_URL = "https://zlsweremfwlrnkjnpnoj.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpsc3dlcmVtZndscm5ram5wbm9qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY3Nzk1NDQsImV4cCI6MjA1MjM1NTU0NH0.dqnPO5OajQlxxt5gze_uiJk3xDifbNqXtgMP_P4gRR4"; // Usa una clave segura
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

let myChart = null; // Para evitar superposiciones de gráficos

// Función para convertir fechas en formato 'DD-MMM-YYYY' a un objeto Date
function parseFecha(fechaStr) {
    // Verificar que la fecha no sea indefinida ni nula
    if (!fechaStr) {
        console.warn("Fecha no válida:", fechaStr);
        return null; // Retornar null si la fecha no es válida
    }

    const meses = {
        'jan': 0, 'feb': 1, 'mar': 2, 'apr': 3, 'may': 4, 'jun': 5,
        'jul': 6, 'aug': 7, 'sep': 8, 'oct': 9, 'nov': 10, 'dec': 11
    };
    const [day, month, year] = fechaStr.toLowerCase().split('-');
    
    // Verificar que la fecha esté en el formato correcto
    if (day && month && year && meses[month] !== undefined) {
        return new Date(year, meses[month], day); // Retorna la fecha solo si es válida
    } else {
        console.warn("Fecha mal formateada:", fechaStr);
        return null; // Retornar null si la fecha es incorrecta
    }
}

// Función para obtener y procesar los datos
async function obtenerDatos() {
    const { data, error } = await supabase.from('produccion').select('*');
    
    if (error) {
        console.error('Error al obtener los datos:', error);
        return;
    }
    
    console.log("Datos obtenidos de Supabase:", data);

    // Procesar los datos
    const df = data.map(row => {
        const fecha = parseFecha(row["fecha del procedimiento programado"]);
        if (fecha) {
            return {
                fecha: fecha,
                procedimiento: row["nombre del procedimiento"]
            };
        } else {
            return null; // Si la fecha es inválida, se omite esta fila
        }
    }).filter(row => row !== null); // Filtrar los registros con fechas inválidas

    console.log("Lista de procedimientos:", df.map(r => r.procedimiento));

    // Filtrar los procedimientos relevantes
    const procedimientosInteres = ['GASTRODUODENOSCOPIA CDAV', 'COLONOSCOPIA CDAV'];
    const dfFiltrado = df.filter(row => procedimientosInteres.includes(row.procedimiento));

    // Si no hay datos filtrados, muestra un mensaje y termina
    if (dfFiltrado.length === 0) {
        console.error("No se encontraron procedimientos relevantes.");
        return;
    }

    // Agrupar por semana y nombre del procedimiento
    const datosAgrupados = dfFiltrado.reduce((acc, row) => {
        const semana = getWeek(row.fecha);
        console.log("Semana calculada para", row.fecha, ":", semana);
        const procedimiento = row.procedimiento;

        if (!acc[semana]) {
            acc[semana] = { 'GASTRODUODENOSCOPIA CDAV': 0, 'COLONOSCOPIA CDAV': 0 };
        }

        acc[semana][procedimiento] += 1;
        return acc;
    }, {});

    // Convertir a arrays para Chart.js
    const semanas = Object.keys(datosAgrupados).sort((a, b) => a - b);
    const gastroduodenoscopia = semanas.map(semana => datosAgrupados[semana]['GASTRODUODENOSCOPIA CDAV']);
    const colonoscopia = semanas.map(semana => datosAgrupados[semana]['COLONOSCOPIA CDAV']);

    // Verificar que los datos no estén vacíos antes de graficar
    if (gastroduodenoscopia.length === 0 || colonoscopia.length === 0) {
        console.error("No hay datos para graficar.");
        return;
    }

    // Graficar los datos
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

    // Destruir el gráfico anterior si existe
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
