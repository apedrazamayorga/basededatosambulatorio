// Configuración específica de colonoscopias
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const SUPABASE_URL = "https://zlsweremfwlrnkjnpnoj.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpsc3dlcmVtZndscm5ram5wbm9qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY3Nzk1NDQsImV4cCI6MjA1MjM1NTU0NH0.dqnPO5OajQlxxt5gze_uiJk3xDifbNqXtgMP_P4gRR4";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function obtenerDatosColonoscopia() {
  const { data, error } = await supabase.from("Reportes").select("fecha, tipo_procedimiento");

  if (error) {
    console.error("Error al obtener datos:", error);
    return;
  }

  procesarDatosColonoscopia(data);
}

function procesarDatosColonoscopia(data) {
  const semanas = {};

  data.forEach(item => {
    if (item.tipo_procedimiento === "colonoscopia") {
      const fecha = new Date(item.fecha);
      const semana = obtenerSemanaDelAno(fecha);
      semanas[semana] = (semanas[semana] || 0) + 1;
    }
  });

function formatearDatosCronologicamente(datos) {
  // Ordenar las semanas de manera numérica
  const semanasOrdenadas = Object.keys(datos)
    .sort((a, b) => {
      // Extraer el número de semana de las cadenas "S1", "S2", ..., "S20"
      const semanaA = parseInt(a.replace('S', ''));
      const semanaB = parseInt(b.replace('S', ''));
      return semanaA - semanaB;  // Ordenar de menor a mayor
    });

  return {
    labels: semanasOrdenadas,
    valores: semanasOrdenadas.map(semana => datos[semana]),
  };
}
  
function obtenerSemanaDelAno(fecha) {
  const inicioAno = new Date(fecha.getFullYear(), 0, 1);
  const dias = Math.floor((fecha - inicioAno) / (24 * 60 * 60 * 1000));
  return `S${Math.ceil((dias + inicioAno.getDay() + 1) / 7)}`;
}

function graficar(datos, titulo) {
  const ctx = document.getElementById("chartSemana").getContext("2d");

  new Chart(ctx, {
    type: "line",
    data: {
      labels: datos.labels,
      datasets: [{
        label: titulo,
        data: datos.valores,
        borderColor: "rgba(75, 192, 192, 1)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        tension: 0.3,
      }],
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
}

obtenerDatosColonoscopia();

