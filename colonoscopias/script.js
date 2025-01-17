import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const SUPABASE_URL = "https://zlsweremfwlrnkjnpnoj.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpsc3dlcmVtZndscm5ram5wbm9qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY3Nzk1NDQsImV4cCI6MjA1MjM1NTU0NH0.dqnPO5OajQlxxt5gze_uiJk3xDifbNqXtgMP_P4gRR4";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function obtenerDatos() {
  const { data, error } = await supabase.from("Reportes").select("fecha, tipo_procedimiento");

  if (error) {
    console.error("Error al obtener datos:", error);
    return;
  }

  procesarDatosSemana(data);
  procesarDatosMensual(data);
  procesarDatosTrimestre(data);
}

// Gráfico semanal
function procesarDatosSemana(data) {
  const semanas = {};
  data.forEach(item => {
    const fecha = new Date(item.fecha);
    const semana = obtenerSemanaDelAno(fecha);
    semanas[semana] = (semanas[semana] || 0) + 1;
  });

  const etiquetas = Object.keys(semanas).sort((a, b) => parseInt(a.replace("S", ""), 10) - parseInt(b.replace("S", ""), 10));
  const valores = etiquetas.map(semana => semanas[semana]);

  graficar({
    ctx: document.getElementById("chartSemana").getContext("2d"),
    etiquetas,
    valores,
    titulo: "Colonoscopias por Semana",
  });
}

// Gráfico mensual y tabla acumulativa
function procesarDatosMensual(data) {
  const meses = {};
  data.forEach(item => {
    const fecha = new Date(item.fecha);
    const mes = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, "0")}`;
    meses[mes] = (meses[mes] || 0) + 1;
  });

  const etiquetas = Object.keys(meses).sort();
  const valores = etiquetas.map(mes => meses[mes]);

  // Crear gráfico
  graficar({
    ctx: document.getElementById("chartMensual").getContext("2d"),
    etiquetas,
    valores,
    titulo: "Colonoscopias por Mes",
  });

  // Llenar tabla acumulativa
  llenarTablaMensual(etiquetas, valores);
}

// Tabla acumulativa mensual
function llenarTablaMensual(etiquetas, valores) {
  const tbody = document.getElementById("tablaMensual");
  tbody.innerHTML = ""; // Limpiar la tabla

  let acumulativo = 0;
  etiquetas.forEach((etiqueta, index) => {
    acumulativo += valores[index];
    const fila = `<tr>
      <td>${etiqueta}</td>
      <td>${valores[index]}</td>
      <td>${acumulativo}</td>
    </tr>`;
    tbody.innerHTML += fila;
  });
}

// Gráfico trimestral
function procesarDatosTrimestre(data) {
  const trimestres = {};
  data.forEach(item => {
    const fecha = new Date(item.fecha);
    const trimestre = obtenerTrimestre(fecha);
    trimestres[trimestre] = (trimestres[trimestre] || 0) + 1;
  });

  const etiquetas = Object.keys(trimestres).sort();
  const valores = etiquetas.map(trimestre => trimestres[trimestre]);

  graficar({
    ctx: document.getElementById("chartTrimestre").getContext("2d"),
    etiquetas,
    valores,
    titulo: "Colonoscopias por Trimestre",
  });
}

// Función general para graficar
function graficar({ ctx, etiquetas, valores, titulo }) {
  const minValor = Math.min(...valores);
  const maxValor = Math.max(...valores);
  const suggestedMin = Math.floor(minValor / 10) * 10;
  const suggestedMax = Math.ceil(maxValor / 10) * 10;

  new Chart(ctx, {
    type: "line",
    data: {
      labels: etiquetas,
      datasets: [{
        label: titulo,
        data: valores,
        borderColor: "rgba(75, 192, 192, 1)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        tension: 0.3,
        pointRadius: valores.map(valor => Math.max(valor / 10, 3)),
        pointHoverRadius: valores.map(valor => Math.max(valor / 10, 5)),
        pointBackgroundColor: "rgba(75, 192, 192, 1)",
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      scales: {
        x: {
          ticks: {
            autoSkip: true,
            maxRotation: 0,
            minRotation: 0,
          },
        },
        y: {
          suggestedMin: suggestedMin,
          suggestedMax: suggestedMax,
          ticks: {
            stepSize: 10,
          },
        },
      },
    },
  });
}

function obtenerSemanaDelAno(fecha) {
  const inicioAno = new Date(fecha.getFullYear(), 0, 1);
  const dias = Math.floor((fecha - inicioAno) / (24 * 60 * 60 * 1000));
  return `S${Math.ceil((dias + inicioAno.getDay() + 1) / 7)}`;
}

function obtenerTrimestre(fecha) {
  const year = fecha.getFullYear();
  const month = fecha.getMonth(); // Meses: 0-11
  const trimestre = Math.floor(month / 3) + 1;
  return `Q${trimestre} ${year}`;
}

obtenerDatos();

obtenerDatos();
