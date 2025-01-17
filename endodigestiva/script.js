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

function generarSemanasDelAño() {
  const semanas = [];
  for (let i = 1; i <= 52; i++) {
    semanas.push(`Semana ${i}`);
  }
  return semanas;
}

function procesarDatosSemanales(data) {
  const semanasDelAño = generarSemanasDelAño();
  const conteoSemanal = semanasDelAño.map(() => ({
    colonoscopias: 0,
    gastroduodenoscopias: 0,
  }));

  data.forEach(({ fecha, tipo_procedimiento }) => {
    const date = new Date(fecha);
    const semana = Math.ceil(
      (date.getDate() + new Date(date.getFullYear(), 0, 1).getDay()) / 7
    );

    if (semana > 0 && semana <= 52) {
      if (tipo_procedimiento === "colonoscopia") {
        conteoSemanal[semana - 1].colonoscopias += 1;
      } else if (tipo_procedimiento === "gastroduodenoscopia") {
        conteoSemanal[semana - 1].gastroduodenoscopias += 1;
      }
    }
  });

  return {
    labels: semanasDelAño,
    colonoscopias: conteoSemanal.map((semana) => semana.colonoscopias),
    gastroduodenoscopias: conteoSemanal.map((semana) => semana.gastroduodenoscopias),
  };
}

function procesarDatosMensuales(data) {
  const meses = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];

  const conteoMensual = meses.map(() => ({
    colonoscopias: 0,
    gastroduodenoscopias: 0,
  }));

  data.forEach(({ fecha, tipo_procedimiento }) => {
    const mes = new Date(fecha).getMonth();
    if (tipo_procedimiento === "colonoscopia") {
      conteoMensual[mes].colonoscopias += 1;
    } else if (tipo_procedimiento === "gastroduodenoscopia") {
      conteoMensual[mes].gastroduodenoscopias += 1;
    }
  });

  return {
    labels: meses,
    colonoscopias: conteoMensual.map((mes) => mes.colonoscopias),
    gastroduodenoscopias: conteoMensual.map((mes) => mes.gastroduodenoscopias),
  };
}

function procesarDatosTrimestrales(data) {
  const trimestres = ["Q1", "Q2", "Q3", "Q4"];
  const conteoTrimestral = trimestres.map(() => ({
    colonoscopias: 0,
    gastroduodenoscopias: 0,
  }));

  data.forEach(({ fecha, tipo_procedimiento }) => {
    const mes = new Date(fecha).getMonth();
    const trimestre = Math.floor(mes / 3);
    if (tipo_procedimiento === "colonoscopia") {
      conteoTrimestral[trimestre].colonoscopias += 1;
    } else if (tipo_procedimiento === "gastroduodenoscopia") {
      conteoTrimestral[trimestre].gastroduodenoscopias += 1;
    }
  });

  return {
    labels: trimestres,
    colonoscopias: conteoTrimestral.map((trim) => trim.colonoscopias),
    gastroduodenoscopias: conteoTrimestral.map((trim) => trim.gastroduodenoscopias),
  };
}

function renderizarGraficoSemanal(datosSemanales) {
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
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  });
}

function renderizarGraficoMensual(datosMensuales) {
  const ctxMensual = document.getElementById("chartMensual").getContext("2d");
  new Chart(ctxMensual, {
    type: "bar",
    data: {
      labels: datosMensuales.labels,
      datasets: [
        {
          label: "Colonoscopias",
          data: datosMensuales.colonoscopias,
          backgroundColor: "rgba(75, 192, 192, 0.6)",
        },
        {
          label: "Gastroduodenoscopias",
          data: datosMensuales.gastroduodenoscopias,
          backgroundColor: "rgba(255, 99, 132, 0.6)",
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { stacked: true },
        y: { beginAtZero: true },
      },
    },
  });
}

function renderizarGraficoTrimestral(datosTrimestrales) {
  const ctxTrimestre = document.getElementById("chartTrimestre").getContext("2d");
  new Chart(ctxTrimestre, {
    type: "bar",
    data: {
      labels: datosTrimestrales.labels,
      datasets: [
        {
          label: "Colonoscopias",
          data: datosTrimestrales.colonoscopias,
          backgroundColor: "rgba(75, 192, 192, 0.6)",
        },
        {
          label: "Gastroduodenoscopias",
          data: datosTrimestrales.gastroduodenoscopias,
          backgroundColor: "rgba(255, 99, 132, 0.6)",
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      scales: {
        y: { beginAtZero: true },
        x: { stacked: true },
      },
    },
  });
}

async function main() {
  const data = await obtenerDatosEndoscopia();
  if (data) {
    const datosSemanales = procesarDatosSemanales(data);
    const datosMensuales = procesarDatosMensuales(data);
    const datosTrimestrales = procesarDatosTrimestrales(data);

    renderizarGraficoSemanal(datosSemanales);
    renderizarGraficoMensual(datosMensuales);
    renderizarGraficoTrimestral(datosTrimestrales);
  }
}

main();
