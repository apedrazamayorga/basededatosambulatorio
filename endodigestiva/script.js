import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const SUPABASE_URL = "https://zlsweremfwlrnkjnpnoj.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpsc3dlcmVtZndscm5ram5wbm9qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY3Nzk1NDQsImV4cCI6MjA1MjM1NTU0NH0.dqnPO5OajQlxxt5gze_uiJk3xDifbNqXtgMP_P4gRR4";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

  async function obtenerDatosEndoscopia() {
      const { data, error } = await supabase.from("Reportes").select("fecha, tipo_procedimiento");

      if (error) {
        console.error("Error al obtener datos:", error);
        return;
      }

      procesarDatosSemanales(data);
      procesarDatosMensuales(data);
      procesarDatosTrimestrales(data);
    }

// Generar todas las semanas del año
function generarSemanasAnuales() {
  const semanas = [];
  for (let i = 1; i <= 52; i++) {
    semanas.push(`Semana ${i}`);
  }
  return semanas;
}

// Asegurar que todas las semanas estén representadas en los datos
function completarSemanas(data) {
  const semanasTotales = generarSemanasAnuales();
  const datosCompletos = semanasTotales.map((semana) => {
    const index = data.labels.indexOf(semana);
    return index !== -1 ? data.values[index] : 0;
  });
  return { labels: semanasTotales, values: datosCompletos };
}

// Datos de ejemplo
const datosColonoscopias = {
  labels: ['Semana 1', 'Semana 2', 'Semana 3', 'Semana 5'],
  values: [10, 15, 8, 20],
};

const datosGastroduodenoscopias = {
  labels: ['Semana 1', 'Semana 3', 'Semana 4', 'Semana 6'],
  values: [5, 6, 7, 9],
};

// Completar datos
const datosSemanalesColonoscopias = completarSemanas(datosColonoscopias);
const datosSemanalesGastroduodenoscopias = completarSemanas(datosGastroduodenoscopias);

// Gráfico semanal
const ctxSemana = document.getElementById('chartSemana').getContext('2d');
new Chart(ctxSemana, {
  type: 'line',
  data: {
    labels: datosSemanalesColonoscopias.labels,
    datasets: [
      {
        label: 'Colonoscopias',
        data: datosSemanalesColonoscopias.values,
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.3,
        pointRadius: 5,
        pointHoverRadius: 8,
      },
      {
        label: 'Gastroduodenoscopias',
        data: datosSemanalesGastroduodenoscopias.values,
        borderColor: 'rgba(255, 99, 132, 1)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        tension: 0.3,
        pointRadius: 5,
        pointHoverRadius: 8,
      },
    ],
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  },
});

// Gráfico semanal
const ctxSemana = document.getElementById('chartSemana').getContext('2d');
new Chart(ctxSemana, {
  type: 'line',
  data: {
    labels: datosSemanales.labels,
    datasets: [
      {
        label: 'Colonoscopias',
        data: datosSemanales.colonoscopias,
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.3,
        pointRadius: 5,
        pointHoverRadius: 8,
      },
      {
        label: 'Gastroduodenoscopias',
        data: datosSemanales.gastroduodenoscopias,
        borderColor: 'rgba(255, 99, 132, 1)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        tension: 0.3,
        pointRadius: 5,
        pointHoverRadius: 8,
      },
    ],
  },
  options: {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  },
});

// Gráfico mensual
const ctxMensual = document.getElementById('chartMensual').getContext('2d');
new Chart(ctxMensual, {
  type: 'bar',
  data: {
    labels: datosMensuales.labels,
    datasets: [
      {
        label: 'Colonoscopias',
        data: datosMensuales.colonoscopias,
        backgroundColor: 'rgba(75, 192, 192, 1)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
      {
        label: 'Gastroduodenoscopias',
        data: datosMensuales.gastroduodenoscopias,
        backgroundColor: 'rgba(255, 99, 132, 1)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
      },
    ],
  },
  options: {
    responsive: true,
    indexAxis: 'y', // Barras horizontales
    scales: {
      x: {
        beginAtZero: true,
      },
    },
  },
});

// Gráfico trimestral
const ctxTrimestre = document.getElementById('chartTrimestre').getContext('2d');
new Chart(ctxTrimestre, {
  type: 'bar',
  data: {
    labels: datosTrimestrales.labels,
    datasets: [
      {
        label: 'Colonoscopias',
        data: datosTrimestrales.colonoscopias,
        backgroundColor: 'rgba(75, 192, 192, 1)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
      {
        label: 'Gastroduodenoscopias',
        data: datosTrimestrales.gastroduodenoscopias,
        backgroundColor: 'rgba(255, 99, 132, 1)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
      },
    ],
  },
  options: {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  },
});
