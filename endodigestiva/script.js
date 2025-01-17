import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const SUPABASE_URL = "https://zlsweremfwlrnkjnpnoj.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpsc3dlcmVtZndscm5ram5wbm9qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY3Nzk1NDQsImV4cCI6MjA1MjM1NTU0NH0.dqnPO5OajQlxxt5gze_uiJk3xDifbNqXtgMP_P4gRR4";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function obtenerDatosEndoscopia() {
  const { data, error } = await supabase
    .from("Reportes")
    .select("fecha, tipo_procedimiento");

  if (error) {
    console.error("Error al obtener datos:", error);
    return null;
  }

  return data;
}

function procesarDatos(data) {
  const datosSemanales = generarDatosPorPeriodo(data, "semana");
  const datosMensuales = generarDatosPorPeriodo(data, "mes");
  const datosTrimestrales = generarDatosPorPeriodo(data, "trimestre");

  return { datosSemanales, datosMensuales, datosTrimestrales };
}

function generarDatosPorPeriodo(data, periodo) {
  const map = new Map();

  data.forEach(({ fecha, tipo_procedimiento }) => {
    const date = new Date(fecha);
    let key;

    if (periodo === "semana") {
      const semana = `Semana ${Math.ceil((date.getDate() + new Date(date.getFullYear(), date.getMonth(), 0).getDay()) / 7)}`;
      key = semana;
    } else if (periodo === "mes") {
      key = new Date(date).toLocaleString("es-ES", { month: "long" });
    } else if (periodo === "trimestre") {
      key = `Q${Math.ceil((date.getMonth() + 1) / 3)}`;
    }

    if (!map.has(key)) {
      map.set(key, { colonoscopias: 0, gastroduodenoscopias: 0 });
    }

    if (tipo_procedimiento === "colonoscopia") {
      map.get(key).colonoscopias += 1;
    } else if (tipo_procedimiento === "gastroduodenoscopia") {
      map.get(key).gastroduodenoscopias += 1;
    }
  });

  const labels = [...map.keys()].sort();
  const colonoscopias = labels.map((label) => map.get(label).colonoscopias);
  const gastroduodenoscopias = labels.map((label) => map.get(label).gastroduodenoscopias);

  return { labels, colonoscopias, gastroduodenoscopias };
}

function renderizarGraficos({ datosSemanales, datosMensuales, datosTrimestrales }) {
  const ctxSemana = document.getElementById("chartSemana").getContext("2d");
  new Chart(ctxSemana, {
    type: "line",
    data: {
      labels: datosSemanales.labels,
      datasets: [
        {
          label: "Colonoscopias",
          data: datosSemanales.colonoscopias,
          borderColor: "rgba(75, 192, 192, 1)",
          backgroundColor: "rgba(75, 192, 192, 0.2)",
          tension: 0.3,
        },
        {
          label: "Gastroduodenoscopias",
          data: datosSemanales.gastroduodenoscopias,
          borderColor: "rgba(255, 99, 132, 1)",
          backgroundColor: "rgba(255, 99, 132, 0.2)",
          tension: 0.3,
        },
      ],
    },
    options: {
      responsive: true,
    },
  });

  const ctxMensual = document.getElementById("chartMensual").getContext("2d");
  new Chart(ctxMensual, {
    type: "bar",
    data: {
      labels: datosMensuales.labels,
      datasets: [
        {
          label: "Colonoscopias",
          data: datosMensuales.colonoscopias,
          backgroundColor: "rgba(75, 192, 192, 1)",
        },
        {
          label: "Gastroduodenoscopias",
          data: datosMensuales.gastroduodenoscopias,
          backgroundColor: "rgba(255, 99, 132, 1)",
        },
      ],
    },
    options: {
      responsive: true,
    },
  });

  const ctxTrimestre = document.getElementById("chartTrimestre").getContext("2d");
  new Chart(ctxTrimestre, {
    type: "bar",
    data: {
      labels: datosTrimestrales.labels,
      datasets: [
        {
          label: "Colonoscopias",
          data: datosTrimestrales.colonoscopias,
          backgroundColor: "rgba(75, 192, 192, 1)",
        },
        {
          label: "Gastroduodenoscopias",
          data: datosTrimestrales.gastroduodenoscopias,
          backgroundColor: "rgba(255, 99, 132, 1)",
        },
      ],
    },
    options: {
      responsive: true,
    },
  });
}

async function main() {
  const data = await obtenerDatosEndoscopia();
  if (data) {
    const procesados = procesarDatos(data);
    renderizarGraficos(procesados);
  }
}

main();
