// Configuración específica de colonoscopias
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const SUPABASE_URL = "https://zlsweremfwlrnkjnpnoj.supabase.co";
const SUPABASE_KEY = "TU_CLAVE_API";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function obtenerDatos() {
  const { data, error } = await supabase.from("Reportes").select("fecha, colonoscopias");

  if (error) {
    console.error("Error al obtener datos:", error);
    return;
  }

  procesarDatos(data);
}

function procesarDatos(data) {
  const semanas = {};
  data.forEach(item => {
    const fecha = new Date(item.fecha);
    const semana = obtenerSemanaDelAno(fecha);
    semanas[semana] = (semanas[semana] || 0) + item.colonoscopias;
  });

  const datosOrdenados = formatearDatosCronologicamente(semanas);
  graficar(datosOrdenados, "Colonoscopias por Semana");
}

function formatearDatosCronologicamente(datos) {
  const semanasOrdenadas = Object.keys(datos).sort();
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

obtenerDatos();
