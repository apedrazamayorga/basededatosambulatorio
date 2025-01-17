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

  procesarDatos(data);
}

function procesarDatos(data) {
  const semanas = {};
  data.forEach(item => {
    if (item.tipo_procedimiento === "colonoscopia") {
      const fecha = new Date(item.fecha);
      const semana = obtenerSemanaDelAno(fecha);
      semanas[semana] = (semanas[semana] || 0) + 1;
    }
  });

  const datosOrdenados = formatearDatosCronologicamente(semanas);
  graficar(datosOrdenados, "Colonoscopias por Semana");
}

function formatearDatosCronologicamente(datos) {
  const semanasOrdenadas = Object.keys(datos)
    .sort((a, b) => {
      const semanaA = parseInt(a.replace('Sem ', ''));
      const semanaB = parseInt(b.replace('Sem ', ''));
      return semanaA - semanaB;
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

  // Calcular valores mínimos y máximos ajustados a las decenas
  const minValor = Math.min(...datos.valores);
  const maxValor = Math.max(...datos.valores);
  const suggestedMin = Math.floor(minValor / 10) * 10; // Redondear hacia abajo a la decena previa
  const suggestedMax = Math.ceil(maxValor / 10) * 10;  // Redondear hacia arriba a la decena posterior

  // Ordenar cronológicamente las semanas
  const sortedLabels = datos.labels.slice().sort((a, b) => {
    const numA = parseInt(a.replace("S", ""), 10); // Extraer el número de la semana
    const numB = parseInt(b.replace("S", ""), 10);
    return numA - numB; // Ordenar numéricamente
  });

  const sortedValues = sortedLabels.map(label => {
    const index = datos.labels.indexOf(label); // Encontrar el índice en los datos originales
    return datos.valores[index];
  });

  // Calcular el total de procedimientos
  const totalProcedimientos = sortedValues.reduce((a, b) => a + b, 0);

  new Chart(ctx, {
    type: "line",
    data: {
      labels: sortedLabels,
      datasets: [{
        label: `${titulo} (Total: ${totalProcedimientos})`, // Mostrar el total en la leyenda
        data: sortedValues,
        borderColor: "rgba(75, 192, 192, 1)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        tension: 0.3,
        pointRadius: sortedValues.map(valor => (valor / 2) * 0.5), // Reducir el tamaño de los círculos al 50%
        pointHoverRadius: sortedValues.map(valor => (valor / 1.5) * 0.5), // También reducir al 50% el tamaño al pasar el mouse
        pointBackgroundColor: "rgba(75, 192, 192, 1)", // Color del círculo
      }],
    },
    options: {
      responsive: true, // Hacer que el gráfico sea responsivo
      maintainAspectRatio: false, // Permitir que la relación de aspecto se adapte al contenedor
      plugins: {
        legend: {
          display: true, // Mostrar la leyenda con el total
          labels: {
            font: {
              size: 14,
            },
          },
        },
      },
      scales: {
        x: {
          ticks: {
            autoSkip: false, // Asegurar que se muestren todas las etiquetas de semanas
          },
        },
        y: {
          beginAtZero: false, // Permite ajustar los límites de la escala manualmente
          suggestedMin: suggestedMin, // Usar la decena previa
          suggestedMax: suggestedMax, // Usar la decena posterior
          ticks: {
            stepSize: 10, // Opcional: Ajusta los pasos entre números si deseas más control
          },
        },
      },
    },
  });
}


obtenerDatos();
