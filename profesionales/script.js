import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const SUPABASE_URL = "https://zlsweremfwlrnkjnpnoj.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpsc3dlcmVtZndscm5ram5wbm9qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY3Nzk1NDQsImV4cCI6MjA1MjM1NTU0NH0.dqnPO5OajQlxxt5gze_uiJk3xDifbNqXtgMP_P4gRR4";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function obtenerDatosCompuestos() {
  const { data, error } = await supabase.from("Reportes").select("fecha, tipo_procedimiento, profesional");

  if (error) {
    console.error("Error al obtener datos:", error);
    return;
  }

  if (!data || data.length === 0) {
    console.error("No se encontraron datos en la base de datos.");
    return;
  }

  console.log("Datos recibidos:", data);

  const datosCompuestos = procesarDatosCompuestos(data);
  crearGraficoCompuesto(datosCompuestos);
}

function procesarDatosCompuestos(data) {
  const resumenMensual = {};

  data.forEach((item) => {
    const fecha = new Date(item.fecha);
    const mes = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, "0")}`;

    const profesional = item.profesional || "Desconocido";

    if (!resumenMensual[mes]) {
      resumenMensual[mes] = {};
    }

    if (!resumenMensual[mes][profesional]) {
      resumenMensual[mes][profesional] = 0;
    }

    if (["colonoscopia", "gastroduodenoscopia"].includes(item.tipo_procedimiento)) {
      resumenMensual[mes][profesional]++;
    }
  });

  const labels = Object.keys(resumenMensual).sort((a, b) => new Date(a) - new Date(b));

  const profesionales = Array.from(
    new Set(data.map((item) => item.profesional || "Desconocido"))
  );

  const datasets = profesionales.map((profesional) => ({
    label: profesional,
    data: labels.map((mes) => resumenMensual[mes]?.[profesional] || 0),
    backgroundColor: generarColorAleatorio(),
  }));

  return { labels, datasets };
}

function crearGraficoCompuesto(datos) {
  const ctx = document.getElementById("chartPorProfesional").getContext("2d");

  new Chart(ctx, {
    type: "bar",
    data: datos,
    options: {
      indexAxis: 'y'.
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: "Número de Procedimientos por Profesional",
        },
        legend: {
          display: true,
          position: "top",
        },
      },
      scales: {
        x: {
          stacked: false,
          title: {
            display: true,
            text: "Meses",
          },
        },
        y: {
          stacked: false,
          beginAtZero: true,
          title: {
            display: true,
            text: "Cantidad de Procedimientos",
          },
        },
      },
    },
  });
}

function generarColorAleatorio() {
  const r = Math.floor(Math.random() * 255);
  const g = Math.floor(Math.random() * 255);
  const b = Math.floor(Math.random() * 255);
  return `rgba(${r}, ${g}, ${b}, 0.8)`;
}

// Llamar a la función principal
obtenerDatosCompuestos();
