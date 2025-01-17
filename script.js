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
      .from("Reportes")
      .select("fecha");

    if (error) {
      console.error("Error al obtener datos:", error);
      return;
    }

    procesarDatos(data);
  } catch (e) {
    console.error("Error general:", e);
  }
}

// Procesar datos y generar gráficos
function procesarDatos(data) {
  const fechas = data.map((item) => new Date(item.fecha));
  const porSemana = agruparPorSemana(fechas);
  const porMes = agruparPorMes(fechas);
  const porTrimestre = agruparPorTrimestre(fechas);

  graficar("chartSemana", porSemana, "Colonoscopias por Semana");
  graficar("chartMes", porMes, "Colonoscopias por Mes");
  graficar("chartTrimestre", porTrimestre, "Colonoscopias por Trimestre");
}

// Agrupar por semana, mes y trimestre (mismo código)
function agruparPorSemana(fechas) {
  const semanas = {};
  fechas.forEach((fecha) => {
    const semana = obtenerSemanaDelAno(fecha);
    semanas[semana] = (semanas[semana] || 0) + 1;
  });
  return formatearDatos(semanas);
}

function agruparPorMes(fechas) {
  const meses = {};
  fechas.forEach((fecha) => {
    const mes = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, "0")}`;
    meses[mes] = (meses[mes] || 0) + 1;
  });
  return formatearDatos(meses);
}

function agruparPorTrimestre(fechas) {
  const trimestres = {};
  fechas.forEach((fecha) => {
    const trimestre = `T${Math.ceil((fecha.getMonth() + 1) / 3)}-${fecha.getFullYear()}`;
    trimestres[trimestre] = (trimestres[trimestre] || 0) + 1;
  });
  return formatearDatos(trimestres);
}

function formatearDatos(datos) {
  return {
    labels: Object.keys(datos),
    valores: Object.values(datos),
  };
}

// Graficar con Chart.js (ajuste para gráfico de líneas)
function graficar(canvasId, datos, titulo) {
  const ctx = document.getElementById(canvasId).getContext("2d");
  new Chart(ctx, {
    type: "line",  // Cambio a tipo línea
    data: {
      labels: datos.labels,
      datasets: [
        {
          label: titulo,
          data: datos.valores,
          backgroundColor: "rgba(75, 192, 192, 0.2)",
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 1,
          fill: false,  // Desactivar el relleno bajo la línea
        },
        {
          label: "Tendencia",
          data: calcularTendencia(datos.valores),
          borderColor: "rgba(255, 99, 132, 1)",  // Línea de tendencia en rojo
          borderWidth: 2,
          fill: false,  // Desactivar el relleno bajo la línea
          borderDash: [5, 5],  // Línea de tendencia discontinua
        }
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: "top",
        },
        title: {
          display: true,
          text: titulo,
        },
      },
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  });
}

// Calcular la línea de tendencia (simple promedio móvil)
function calcularTendencia(valores) {
  let tendencia = [];
  for (let i = 0; i < valores.length; i++) {
    if (i === 0) {
      tendencia.push(valores[i]);
    } else {
      tendencia.push((valores[i] + valores[i - 1]) / 2);  // Promedio simple de los valores consecutivos
    }
  }
  return tendencia;
}

// Llamar a la función principal
obtenerDatos();
