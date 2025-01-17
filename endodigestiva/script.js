import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const SUPABASE_URL = "https://zlsweremfwlrnkjnpnoj.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpsc3dlcmVtZndscm5ram5wbm9qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY3Nzk1NDQsImV4cCI6MjA1MjM1NTU0NH0.dqnPO5OajQlxxt5gze_uiJk3xDifbNqXtgMP_P4gRR4";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);


// Función principal para obtener y procesar los datos
async function obtenerDatos() {
  const { data, error } = await supabase.from("Reportes").select("fecha, tipo_procedimiento");

  if (error) {
    console.error("Error al obtener datos:", error);
    return;
  }

  const datosSemanales = procesarDatosSemanales(data);
  graficarSemanales(datosSemanales);

  const datosMensuales = procesarDatosMensuales(data);
  graficarMensuales(datosMensuales);

  const datosTrimestrales = procesarDatosTrimestrales(data);
  graficarTrimestrales(datosTrimestrales);
}

// Procesar datos semanales
function procesarDatosSemanales(data) {
  const semanas = Array.from({ length: 52 }, (_, i) => `Semana ${i + 1}`);
  const colonoscopias = Array(52).fill(0);
  const gastroduodenoscopias = Array(52).fill(0);

  data.forEach(({ fecha, tipo_procedimiento }) => {
    const date = new Date(fecha);
    const semana = Math.floor((date.getDayOfYear() - 1) / 7);
    if (tipo_procedimiento === "colonoscopia") colonoscopias[semana]++;
    else if (tipo_procedimiento === "gastroduodenoscopia") gastroduodenoscopias[semana]++;
  });

  return { semanas, colonoscopias, gastroduodenoscopias };
}

// Procesar datos mensuales
function procesarDatosMensuales(data) {
  const meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
  const colonoscopias = Array(12).fill(0);
  const gastroduodenoscopias = Array(12).fill(0);

  data.forEach(({ fecha, tipo_procedimiento }) => {
    const mes = new Date(fecha).getMonth();
    if (tipo_procedimiento === "colonoscopia") colonoscopias[mes]++;
    else if (tipo_procedimiento === "gastroduodenoscopia") gastroduodenoscopias[mes]++;
  });

  return { meses, colonoscopias, gastroduodenoscopias };
}

// Procesar datos trimestrales
function procesarDatosTrimestrales(data) {
  const trimestres = ["Trimestre 1", "Trimestre 2", "Trimestre 3", "Trimestre 4"];
  const colonoscopias = Array(4).fill(0);
  const gastroduodenoscopias = Array(4).fill(0);

  data.forEach(({ fecha, tipo_procedimiento }) => {
    const trimestre = Math.floor(new Date(fecha).getMonth() / 3);
    if (tipo_procedimiento === "colonoscopia") colonoscopias[trimestre]++;
    else if (tipo_procedimiento === "gastroduodenoscopia") gastroduodenoscopias[trimestre]++;
  });

  return { trimestres, colonoscopias, gastroduodenoscopias };
}

// Graficar datos semanales
function graficarSemanales({ semanas, colonoscopias, gastroduodenoscopias }) {
  const ctx = document.getElementById("chartSemana").getContext("2d");
  new Chart(ctx, {
    type: "line",
    data: {
      labels: semanas,
      datasets: [
        {
          label: "Colonoscopias",
          data: colonoscopias,
          borderColor: "rgba(75, 192, 192, 1)",
          backgroundColor: "rgba(75, 192, 192, 0.2)",
        },
        {
          label: "Gastroduodenoscopias",
          data: gastroduodenoscopias,
          borderColor: "rgba(255, 99, 132, 1)",
          backgroundColor: "rgba(255, 99, 132, 0.2)",
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
    },
  });
}

// Graficar datos mensuales
function graficarMensuales({ meses, colonoscopias, gastroduodenoscopias }) {
  const ctx = document.getElementById("chartMensual").getContext("2d");
  new Chart(ctx, {
    type: "bar",
    data: {
      labels: meses,
      datasets: [
        {
          label: "Colonoscopias",
          data: colonoscopias,
          backgroundColor: "rgba(75, 192, 192, 0.8)",
        },
        {
          label: "Gastroduodenoscopias",
          data: gastroduodenoscopias,
          backgroundColor: "rgba(255, 99, 132, 0.8)",
        },
      ],
    },
    options: {
      responsive: true,
      indexAxis: "y",
      maintainAspectRatio: false,
    },
  });
}

// Graficar datos trimestrales
function graficarTrimestrales({ trimestres, colonoscopias, gastroduodenoscopias }) {
  const ctx = document.getElementById("chartTrimestral").getContext("2d");
  new Chart(ctx, {
    type: "bar",
    data: {
      labels: trimestres,
      datasets: [
        {
          label: "Colonoscopias",
          data: colonoscopias,
          backgroundColor: "rgba(75, 192, 192, 0.8)",
        },
        {
          label: "Gastroduodenoscopias",
          data: gastroduodenoscopias,
          backgroundColor: "rgba(255, 99, 132, 0.8)",
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
    },
  });
}

// Iniciar la obtención de datos
obtenerDatos();
