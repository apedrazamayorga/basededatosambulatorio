// Importar Supabase
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

// Configuración de Supabase
const SUPABASE_URL = "https://zlsweremfwlrnkjnpnoj.supabase.co"; // Reemplaza con tu URL de Supabase
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpsc3dlcmVtZndscm5ram5wbm9qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY3Nzk1NDQsImV4cCI6MjA1MjM1NTU0NH0.dqnPO5OajQlxxt5gze_uiJk3xDifbNqXtgMP_P4gRR4"; // Reemplaza con tu clave API de Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Función principal para obtener y procesar datos
async function obtenerDatos() {
  try {
    const { data, error } = await supabase
      .from("Reportes") // Nombre de la tabla de Supabase
      .select("fecha");

    if (error) {
      console.error("Error al obtener datos:", error);
      return;
    }

    // Procesar los datos
    procesarDatos(data);
  } catch (e) {
    console.error("Error general:", e);
  }
}

// Procesar los datos y graficar
function procesarDatos(data) {
  const fechas = data.map((item) => new Date(item.fecha));
  const porSemana = agruparPorSemana(fechas);
  graficar(porSemana);
}

// Agrupar los datos por semana
function agruparPorSemana(fechas) {
  const semanas = {};

  fechas.forEach((fecha) => {
    const semana = obtenerSemanaDelAno(fecha);
    semanas[semana] = (semanas[semana] || 0) + 1;
  });

  return formatearDatos(semanas);
}

// Formatear los datos para el gráfico
function formatearDatos(datos) {
  return {
    labels: Object.keys(datos),
    valores: Object.values(datos),
  };
}

// Función para obtener la semana del año
function obtenerSemanaDelAno(fecha) {
  const inicioAno = new Date(fecha.getFullYear(), 0, 1);
  const diasTranscurridos = Math.floor((fecha - inicioAno) / (24 * 60 * 60 * 1000));
  return `Enero S${Math.ceil((diasTranscurridos + inicioAno.getDay() + 1) / 7)}`;
}

// Graficar con Chart.js
function graficar(datosSemana) {
  const ctx = document.getElementById("chartSemana").getContext("2d");

  const minValor = 0;  // El eje Y comienza en 0
  const maxValor = Math.max(...datosSemana.valores);  // Máximo valor de los datos

  new Chart(ctx, {
    type: "line",
    data: {
      labels: datosSemana.labels, // Semanas del año
      datasets: [{
        label: 'Colonoscopias por Semana',
        data: datosSemana.valores,
        borderColor: "rgba(75, 192, 192, 1)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        tension: 0.3,
        borderWidth: 2,
        pointStyle: "circle",
        pointRadius: 5,
        pointBackgroundColor: "rgba(75, 192, 192, 1)",
        fill: false,
        borderWidth: 2
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: "top" },
        title: {
          display: true,
          text: "Colonoscopias",
          color: "#000",
          align: "start",
        },
      },
      options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true, // Inicia en 0
              min: minValor,     // Mínimo en 0
              max: maxValor,     // Máximo de los datos
              ticks: {
                color: '#000',
          },
        },
        x: {
          beginAtZero: true,
          ticks: {
            color: '#000',
          },
        },
      },
    },
  });
}

// Llamar a la función principal
obtenerDatos();
