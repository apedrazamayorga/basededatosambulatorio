import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const SUPABASE_URL = "https://zlsweremfwlrnkjnpnoj.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpsc3dlcmVtZndscm5ram5wbm9qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY3Nzk1NDQsImV4cCI6MjA1MjM1NTU0NH0.dqnPO5OajQlxxt5gze_uiJk3xDifbNqXtgMP_P4gRR4";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const SUPABASE_URL = "https://zlsweremfwlrnkjnpnoj.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpsc3dlcmVtZndscm5ram5wbm9qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY3Nzk1NDQsImV4cCI6MjA1MjM1NTU0NH0.dqnPO5OajQlxxt5gze_uiJk3xDifbNqXtgMP_P4gRR4";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function obtenerDatos() {
  const { data, error } = await supabase
    .from("Reportes")
    .select("fecha, tipo_procedimiento");

  if (error) {
    console.error("Error al obtener datos:", error);
    return;
  }

  const datosSemanales = procesarDatosSemanales(data);
  const datosMensuales = procesarDatosMensuales(data);
  const datosTrimestrales = procesarDatosTrimestrales(data);

  crearGraficoSemanal(datosSemanales);
  crearGraficoMensual(datosMensuales);
  crearGraficoTrimestral(datosTrimestrales);
}

function procesarDatosMensuales(data) {
  const resumenMensual = {};

  data.forEach((item) => {
    const fecha = new Date(item.fecha);
    const mes = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, "0")}`;

    if (!resumenMensual[mes]) {
      resumenMensual[mes] = { colonoscopias: 0, gastroduodenoscopias: 0 };
    }

    if (item.tipo_procedimiento === "colonoscopia") {
      resumenMensual[mes].colonoscopias++;
    } else if (item.tipo_procedimiento === "gastroduodenoscopia") {
      resumenMensual[mes].gastroduodenoscopias++;
    }
  });

  const labels = Object.keys(resumenMensual);
  const colonoscopias = labels.map((mes) => resumenMensual[mes].colonoscopias);
  const gastroduodenoscopias = labels.map((mes) => resumenMensual[mes].gastroduodenoscopias);

  return { labels, colonoscopias, gastroduodenoscopias };
}

function crearGraficoMensual(datos) {
  const ctx = document.getElementById("chartMensual").getContext("2d");
  new Chart(ctx, {
    type: "bar",
    data: {
      labels: datos.labels,
      datasets: [
        {
          label: "Colonoscopias",
          data: datos.colonoscopias,
          backgroundColor: "rgba(75, 192, 192, 1)",
        },
        {
          label: "Gastroduodenoscopias",
          data: datos.gastroduodenoscopias,
          backgroundColor: "rgba(255, 99, 132, 1)",
        },
      ],
    },
    options: {
      responsive: true,
      scales: {
        x: {
          stacked: true, // Habilitar apilamiento en el eje X
        },
        y: {
          stacked: true, // Habilitar apilamiento en el eje Y
          beginAtZero: true,
        },
      },
    },
  });
}

function crearGraficoTrimestral(datos) {
  const ctx = document.getElementById("chartTrimestre").getContext("2d");
  new Chart(ctx, {
    type: "bar",
    data: {
      labels: datos.labels,
      datasets: [
        {
          label: "Colonoscopias",
          data: datos.colonoscopias,
          backgroundColor: "rgba(75, 192, 192, 1)",
        },
        {
          label: "Gastroduodenoscopias",
          data: datos.gastroduodenoscopias,
          backgroundColor: "rgba(255, 99, 132, 1)",
        },
      ],
    },
    options: {
      responsive: true,
      scales: {
        x: {
          stacked: true,
        },
        y: {
          stacked: true,
          beginAtZero: true,
        },
      },
    },
  });
}

obtenerDatos();
