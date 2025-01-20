import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const SUPABASE_URL = "https://zlsweremfwlrnkjnpnoj.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpsc3dlcmVtZndscm5ram5wbm9qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY3Nzk1NDQsImV4cCI6MjA1MjM1NTU0NH0.dqnPO5OajQlxxt5gze_uiJk3xDifbNqXtgMP_P4gRR4";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function obtenerDatosPorMes() {
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

  const datosPorMes = procesarDatosPorMes(data);
  crearPestañas(datosPorMes);
}

function procesarDatosPorMes(data) {
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

  return resumenMensual;
}

function crearPestañas(datosPorMes) {
  const pestañas = document.getElementById("pestañas");
  pestañas.innerHTML = ""; // Limpiar pestañas previas

  const meses = Object.keys(datosPorMes).sort((a, b) => new Date(a) - new Date(b));

  // Crear botón para cada mes
  meses.forEach((mes, index) => {
    const boton = document.createElement("button");
    boton.textContent = mes;
    boton.style.margin = "5px";
    boton.style.padding = "5px 10px";
    boton.style.border = "1px solid #000";
    boton.style.borderRadius = "5px";
    boton.style.backgroundColor = index === 0 ? "#000" : "#fff"; // Resaltar el primero
    boton.style.color = index === 0 ? "#fff" : "#000";
    boton.style.cursor = "pointer";

    boton.addEventListener("click", () => {
      actualizarGrafico(datosPorMes[mes], mes);
      resaltarPestaña(boton, pestañas);
    });

    pestañas.appendChild(boton);
  });

  // Mostrar datos del primer mes por defecto
  actualizarGrafico(datosPorMes[meses[0]], meses[0]);
}

function resaltarPestaña(botonSeleccionado, contenedor) {
  const botones = contenedor.querySelectorAll("button");
  botones.forEach((boton) => {
    boton.style.backgroundColor = "#fff";
    boton.style.color = "#000";
  });
  botonSeleccionado.style.backgroundColor = "#000";
  botonSeleccionado.style.color = "#fff";
}

function actualizarGrafico(datosMes, mes) {
  const labels = Object.keys(datosMes);
  const data = Object.values(datosMes);

  const datos = {
    labels,
    datasets: [
      {
        label: `Procedimientos en ${mes}`,
        data,
        backgroundColor: generarColorAleatorio(),
      },
    ],
  };

  if (window.graficoPorProfesional) {
    window.graficoPorProfesional.data = datos;
    window.graficoPorProfesional.update();
  } else {
    const ctx = document.getElementById("chartPorProfesional").getContext("2d");
    window.graficoPorProfesional = new Chart(ctx, {
      type: "bar",
      data: datos,
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: "Procedimientos por Profesional",
          },
          legend: {
            display: true,
          },
        },
        scales: {
          x: { beginAtZero: true },
          y: { beginAtZero: true },
        },
      },
    });
  }
}

function generarColorAleatorio() {
  const r = Math.floor(Math.random() * 255);
  const g = Math.floor(Math.random() * 255);
  const b = Math.floor(Math.random() * 255);
  return `rgba(${r}, ${g}, ${b}, 0.8)`;
}

// Llamar a la función principal
obtenerDatosPorMes();
