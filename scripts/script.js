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

  const minValor = Math.min(...datosSemana.valores);  // Mínimo valor
  const maxValor = Math.max(...datosSemana.valores);  // Máximo valor

  new Chart(ctx, {
    type: "line",
    data: {
      labels: datosSemana.labels,
      datasets: [{
        label: 'Colonoscopias por Semana',
        data: datosSemana.valores,
        borderColor: "rgba(75, 192, 192, 1)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
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
          text: "Colonoscopias por Semana",
          color: "#000",
          align: "start",
        },
      },
      scales: {
        y: {
          beginAtZero: false,
          min: minValor - 5, // Límites ajustados
          max: maxValor + 5, // Límites ajustados
          ticks: {
            color: '#000',
          },
          grid: {
            color: 'rgba(255, 0, 0, 0.2)',  // Línea horizontal en rojo pálido
            lineWidth: 1,
          },
        },
      },
      annotation: {
        annotations: [
          {
            type: 'line',
            mode: 'horizontal',
            scaleID: 'y',
            value: minValor,
            borderColor: 'rgba(255, 99, 132, 0.5)',
            borderWidth: 2,
            label: {
              enabled: true,
              content: `Min: ${minValor}`,
              position: 'left',
              backgroundColor: 'rgba(255, 99, 132, 0.5)',
              font: { color: '#000', size: 12 },
            },
          },
          {
            type: 'line',
            mode: 'horizontal',
            scaleID: 'y',
            value: maxValor,
            borderColor: 'rgba(255, 99, 132, 0.5)',
            borderWidth: 2,
            label: {
              enabled: true,
              content: `Max: ${maxValor}`,
              position: 'left',
              backgroundColor: 'rgba(255, 99, 132, 0.5)',
              font: { color: '#000', size: 12 },
            },
          },
        ],
      },
    },
  });
}

// Llamar a la función principal
obtenerDatos();
