import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const SUPABASE_URL = "https://zlsweremfwlrnkjnpnoj.supabase.co";
const SUPABASE_KEY = "your_supabase_key_here";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Almacenar las referencias de los gráficos
let graficos = [];

async function obtenerDatosPorProfesional() {
  const { data, error } = await supabase.from("Reportes").select("fecha, tipo_procedimiento, profesional");

  if (error) {
    console.error("Error al obtener datos:", error);
    return;
  }

  const datosMensuales = procesarDatosAgrupados(data, "mensual");
  const datosTrimestrales = procesarDatosAgrupados(data, "trimestral");
  const datosAnuales = procesarDatosAgrupados(data, "anual");

  graficos = [
    crearGraficoAgrupado("chartMensual", datosMensuales, "Mensual"),
    crearGraficoAgrupado("chartTrimestral", datosTrimestrales, "Trimestral"),
    crearGraficoAgrupado("chartAnual", datosAnuales, "Anual"),
  ];

  crearLeyendaInteractiva(datosMensuales.datasets.map((ds) => ds.label));
}

function procesarDatosAgrupados(data, periodo) {
  const resumen = {};

  data.forEach((item) => {
    const fecha = new Date(item.fecha);
    let clavePeriodo;

    if (periodo === "mensual") {
      clavePeriodo = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, "0")}`;
    } else if (periodo === "trimestral") {
      const trimestre = Math.floor(fecha.getMonth() / 3) + 1;
      clavePeriodo = `${fecha.getFullYear()}-T${trimestre}`;
    } else if (periodo === "anual") {
      clavePeriodo = `${fecha.getFullYear()}`;
    }

    const profesional = item.profesional || "Desconocido";

    if (!resumen[clavePeriodo]) {
      resumen[clavePeriodo] = {};
    }
    if (!resumen[clavePeriodo][profesional]) {
      resumen[clavePeriodo][profesional] = 0;
    }

    if (["colonoscopia", "gastroduodenoscopia"].includes(item.tipo_procedimiento)) {
      resumen[clavePeriodo][profesional]++;
    }
  });

  const labels = Object.keys(resumen).sort((a, b) => {
    const dateA = new Date(a.replace(/-T\d/, ""));
    const dateB = new Date(b.replace(/-T\d/, ""));
    return dateA - dateB;
  });

  const profesionales = Array.from(
    new Set(data.map((item) => item.profesional || "Desconocido"))
  );

  const datasets = profesionales.map((profesional) => ({
    label: profesional,
    data: labels.map((periodo) => resumen[periodo]?.[profesional] || 0),
    backgroundColor: generarColorAleatorio(),
  }));

  return { labels, datasets };
}

function crearGraficoAgrupado(canvasId, datos, titulo) {
  const ctx = document.getElementById(canvasId).getContext("2d");
  return new Chart(ctx, {
    type: "bar",
    data: datos,
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: titulo,
        },
        legend: {
          display: false, // Desactivar la leyenda predeterminada
        },
      },
      scales: {
        x: { stacked: true },
        y: { stacked: true, beginAtZero: true },
      },
    },
  });
}

function crearLeyendaInteractiva(profesionales) {
  const leyenda = document.getElementById("leyenda");
  leyenda.innerHTML = ""; // Limpiar leyenda previa

  profesionales.forEach((profesional) => {
    const boton = document.createElement("button");
    boton.textContent = profesional;
    boton.style.margin = "0 5px";
    boton.style.padding = "5px 10px";
    boton.style.backgroundColor = generarColorAleatorio();
    boton.style.border = "none";
    boton.style.borderRadius = "5px";
    boton.style.color = "white";
    boton.style.cursor = "pointer";

    boton.addEventListener("click", () => {
      graficos.forEach((grafico) => {
        grafico.data.datasets.forEach((dataset) => {
          dataset.hidden = dataset.label !== profesional; // Mostrar solo el profesional seleccionado
        });
        grafico.update();
      });
    });

    leyenda.appendChild(boton);
  });
}

function generarColorAleatorio() {
  const r = Math.floor(Math.random() * 255);
  const g = Math.floor(Math.random() * 255);
  const b = Math.floor(Math.random() * 255);
  return `rgba(${r}, ${g}, ${b}, 0.8)`;
}

// Llamar a la función principal
obtenerDatosPorProfesional();
