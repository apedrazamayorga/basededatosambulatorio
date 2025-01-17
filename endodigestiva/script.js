import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const SUPABASE_URL = "https://zlsweremfwlrnkjnpnoj.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpsc3dlcmVtZndscm5ram5wbm9qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY3Nzk1NDQsImV4cCI6MjA1MjM1NTU0NH0.dqnPO5OajQlxxt5gze_uiJk3xDifbNqXtgMP_P4gRR4";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Función para calcular el día del año
function getDayOfYear(date) {
    const startOfYear = new Date(date.getFullYear(), 0, 0);
    const diff = date - startOfYear + ((startOfYear.getTimezoneOffset() - date.getTimezoneOffset()) * 60 * 1000);
    return Math.floor(diff / (1000 * 60 * 60 * 24));
}

// Procesar datos semanales
function procesarDatosSemanales(data) {
    const semanas = {};

    data.forEach((item) => {
        const date = new Date(item.fecha);
        const dayOfYear = getDayOfYear(date);
        const week = Math.ceil(dayOfYear / 7);
        const key = `Semana ${week}`;

        if (!semanas[key]) {
            semanas[key] = { colonoscopias: 0, gastroduodenoscopias: 0 };
        }

        if (item.tipo_procedimiento === "colonoscopia") {
            semanas[key].colonoscopias++;
        } else if (item.tipo_procedimiento === "gastroduodenoscopia") {
            semanas[key].gastroduodenoscopias++;
        }
    });

    return semanas;
}

// Procesar datos mensuales
function procesarDatosMensuales(data) {
    const meses = Array.from({ length: 12 }, () => ({ colonoscopias: 0, gastroduodenoscopias: 0 }));

    data.forEach((item) => {
        const date = new Date(item.fecha);
        const month = date.getMonth(); // Mes (0-11)

        if (item.tipo_procedimiento === "colonoscopia") {
            meses[month].colonoscopias++;
        } else if (item.tipo_procedimiento === "gastroduodenoscopia") {
            meses[month].gastroduodenoscopias++;
        }
    });

    return meses;
}

// Procesar datos trimestrales
function procesarDatosTrimestrales(data) {
    const trimestres = Array.from({ length: 4 }, () => ({ colonoscopias: 0, gastroduodenoscopias: 0 }));

    data.forEach((item) => {
        const date = new Date(item.fecha);
        const quarter = Math.floor(date.getMonth() / 3); // Trimestre (0-3)

        if (item.tipo_procedimiento === "colonoscopia") {
            trimestres[quarter].colonoscopias++;
        } else if (item.tipo_procedimiento === "gastroduodenoscopia") {
            trimestres[quarter].gastroduodenoscopias++;
        }
    });

    return trimestres;
}

// Renderizar gráficos
function renderizarGraficos(semanales, mensuales, trimestrales) {
    const ctxSemana = document.getElementById("chartSemana").getContext("2d");
    const ctxMensual = document.getElementById("chartMensual").getContext("2d");
    const ctxTrimestre = document.getElementById("chartTrimestre").getContext("2d");

    // Gráfico semanal
    new Chart(ctxSemana, {
        type: "line",
        data: {
            labels: Object.keys(semanales),
            datasets: [
                {
                    label: "Colonoscopias",
                    data: Object.values(semanales).map((item) => item.colonoscopias),
                    borderColor: "rgba(75, 192, 192, 1)",
                    backgroundColor: "rgba(75, 192, 192, 0.2)",
                    tension: 0.3,
                    pointRadius: 5,
                    pointHoverRadius: 8,
                },
                {
                    label: "Gastroduodenoscopias",
                    data: Object.values(semanales).map((item) => item.gastroduodenoscopias),
                    borderColor: "rgba(255, 99, 132, 1)",
                    backgroundColor: "rgba(255, 99, 132, 0.2)",
                    tension: 0.3,
                    pointRadius: 5,
                    pointHoverRadius: 8,
                },
            ],
        },
        options: {
            responsive: true,
        },
    });

    // Gráfico mensual
    new Chart(ctxMensual, {
        type: "bar",
        data: {
            labels: [
                "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
                "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
            ],
            datasets: [
                {
                    label: "Colonoscopias",
                    data: mensuales.map((item) => item.colonoscopias),
                    backgroundColor: "rgba(75, 192, 192, 1)",
                },
                {
                    label: "Gastroduodenoscopias",
                    data: mensuales.map((item) => item.gastroduodenoscopias),
                    backgroundColor: "rgba(255, 99, 132, 1)",
                },
            ],
        },
        options: {
            responsive: true,
            indexAxis: "y", // Barras horizontales
        },
    });

    // Gráfico trimestral
    new Chart(ctxTrimestre, {
        type: "bar",
        data: {
            labels: ["Q1", "Q2", "Q3", "Q4"],
            datasets: [
                {
                    label: "Colonoscopias",
                    data: trimestrales.map((item) => item.colonoscopias),
                    backgroundColor: "rgba(75, 192, 192, 1)",
                },
                {
                    label: "Gastroduodenoscopias",
                    data: trimestrales.map((item) => item.gastroduodenoscopias),
                    backgroundColor: "rgba(255, 99, 132, 1)",
                },
            ],
        },
        options: {
            responsive: true,
        },
    });
}

// Obtener datos
async function obtenerDatos() {
    const { data, error } = await supabase.from("Reportes").select("fecha, tipo_procedimiento");

    if (error) {
        console.error("Error al obtener datos:", error);
        return;
    }

    const semanales = procesarDatosSemanales(data);
    const mensuales = procesarDatosMensuales(data);
    const trimestrales = procesarDatosTrimestrales(data);

    renderizarGraficos(semanales, mensuales, trimestrales);
}

obtenerDatos();
