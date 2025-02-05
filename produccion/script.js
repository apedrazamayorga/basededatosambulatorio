// Configuración de Supabase
const SUPABASE_URL = 'https://zlsweremfwlrnkjnpnoj.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpsc3dlcmVtZndscm5ram5wbm9qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY3Nzk1NDQsImV4cCI6MjA1MjM1NTU0NH0.dqnPO5OajQlxxt5gze_uiJk3xDifbNqXtgMP_P4gRR4';
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY); // Inicialización correcta

// Función para obtener y procesar los datos
async function obtenerDatos() {
    // Consulta a la base de datos
    const { data, error } = await supabase
        .from('produccion') // Nombre de la tabla en Supabase
        .select('*');

    if (error) {
        console.error('Error al obtener los datos:', error);
        return;
    }

    // Procesar los datos
    const df = data.map(row => ({
        fecha: new Date(row['fecha del procedimiento programado']), // Columna de fecha
        procedimiento: row['nombre del procedimiento'] // Columna de nombre del procedimiento
    }));

    // Filtrar solo los procedimientos que nos interesan
    const procedimientosInteres = ['GASTRODUODENOSCOPIA CDAV', 'COLONOSCOPIA CDAV'];
    const dfFiltrado = df.filter(row => procedimientosInteres.includes(row.procedimiento));

    // Agrupar por semana y nombre del procedimiento
    const datosAgrupados = dfFiltrado.reduce((acc, row) => {
        const semana = getWeek(row.fecha);
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

    // Graficar los datos
    graficarDatos(semanas, gastroduodenoscopia, colonoscopia);
}

// Función para obtener el número de semana del año
function getWeek(date) {
    const startOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date - startOfYear) / 86400000;
    return Math.ceil((pastDaysOfYear + startOfYear.getDay() + 1) / 7);
}

// Función para graficar los datos con Chart.js
function graficarDatos(semanas, gastroduodenoscopia, colonoscopia) {
    const ctx = document.getElementById('myChart').getContext('2d');
    const myChart = new Chart(ctx, {
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
                   
