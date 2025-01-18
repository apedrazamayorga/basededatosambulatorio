
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const SUPABASE_URL = "https://zlsweremfwlrnkjnpnoj.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpsc3dlcmVtZndscm5ram5wbm9qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY3Nzk1NDQsImV4cCI6MjA1MjM1NTU0NH0.dqnPO5OajQlxxt5gze_uiJk3xDifbNqXtgMP_P4gRR4";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Función principal para obtener datos de Supabase y generar gráficos
async function obtenerDatosPorProfesional() {
  const { data, error } = await supabase
    .from("Reportes")
    .select("fecha, tipo_procedimiento, profesional");

  if (error) {
    console.error("Error al obtener datos:", error);
    return;
  }

  // Procesar los datos por periodo
  const datosMensuales = procesarDatosPorProfesional(data, "mensual");
  const datosTrimestrales = procesarDatosPorProfesional(data, "trimestral");
  const datosAnuales = procesarDatosPorProfesional(data, "anual");

  // Crear los gráficos
  crearGraficoMensualPorProfesional(datosMensuales);
  crearGraficoTrimestralPorProfesional(datosTrimestrales);
  crearGraficoAnualPorProfesional(datosAnuales);
}

// Función para procesar datos por profesional y periodo
function procesarDatosPorProfesional(data, periodo) {
  const resumen = {};

  data.forEach((item) => {
    const fecha = new Date(item.fecha);
    let key;

    // Determinar el periodo: mensual, trimestral o anual
    if (periodo === "mensual") {
      key = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, "0")}`;
    } else if (periodo === "trimestral") {
      key = `${fecha.getFullYear()}-T${Math.floor(fecha.getMonth() / 3) + 1}`;
    } else if (periodo === "anual") {
      key = `${fecha.getFullYear()}`;
    }

    // Inicializar las estructuras necesarias
    if (!resumen[key]) {
      resumen[key] = {};
    }

    if (!resumen[key][item.profesional]) {
      resumen[key][item.profesional] = 0;
    }

    // Contar solo las colonoscopias
    if (item.tipo_procedimiento === "colonoscopia") {
      resumen[key][item.profesional]++;
    }
  });

  // Crear etiquetas y datasets para Chart.js
  const labels = Object.keys(resumen);
  const profesionales = [...new Set(data.map((item) => item.profesional))];
  const datasets = profesionales.map((profesional) => ({
    label: profesional,
    data: labels.map((label) => resumen[label][profesional] || 0),
    backgroundColor: `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(
      Math.random() * 255
    )}, 0.7)`, // Colores aleatorios para cada profesional
  }));

  return { labels, datasets };
}

// Función para crear gráfico mensual por profesional
function crearGraficoMensualPorProfesional(datos) {
  const ctx = document.getElementById("chartMensualProfesional").getContext("2d");
  const stackedBar = new Chart(ctx, {
    type: "bar",
    data: {
      labels: datos.labels,
      datasets: datos.datasets,
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: "top",
        },
      },
      scales: {
        y: {
          stacked: true,
        },
        x: {
          beginAtZero: true,
          stacked: true,
        },
      },
    },
  });
}

// Función para crear gráfico trimestral por profesional
function crearGraficoTrimestralPorProfesional(datos) {
  const ctx = document.getElementById("chartTrimestralProfesional").getContext("2d");
  new Chart(ctx, {
    type: "bar",
    data: {
      labels: datos.labels,
      datasets: datos.datasets,
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: "top",
        },
      },
      scales: {
        x: {
          stacked: false,
        },
        y: {
          beginAtZero: true,
        },
      },
    },
  });
}

// Función para crear gráfico anual por profesional
function crearGraficoAnualPorProfesional(datos) {
  const ctx = document.getElementById("chartAnualProfesional").getContext("2d");
  new Chart(ctx, {
    type: "bar",
    data: {
      labels: datos.labels,
      datasets: datos.datasets,
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: "top",
        },
      },
      scales: {
        x: {
          stacked: false,
        },
        y: {
          beginAtZero: true,
        },
      },
    },
  });
}

// Llamar a la función para iniciar el proceso
obtenerDatosPorProfesional();

