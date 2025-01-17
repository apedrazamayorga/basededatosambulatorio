    const SUPABASE_URL = "https://zlsweremfwlrnkjnpnoj.supabase.co";
    const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpsc3dlcmVtZndscm5ram5wbm9qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY3Nzk1NDQsImV4cCI6MjA1MjM1NTU0NH0.dqnPO5OajQlxxt5gze_uiJk3xDifbNqXtgMP_P4gRR4";
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

  async function obtenerDatosEndoscopia() {
      const { data, error } = await supabase.from("Reportes").select("fecha, tipo_procedimiento");

      if (error) {
        console.error("Error al obtener datos:", error);
        return;
      }

      procesarDatosSemanaEndoscopia(data);
      procesarDatosMensualEndoscopia(data);
      procesarDatosTrimestreEndoscopia(data);
    }

    // Gráfico semanal (líneas)
    function procesarDatosSemanaEndoscopia(data) {
      const semanas = {};
      data.forEach(item => {
        if (item.tipo_procedimiento === 'Gastroduodenoscopia') {
          const fecha = new Date(item.fecha);
          const semana = obtenerSemanaDelAno(fecha);
          semanas[semana] = (semanas[semana] || 0) + 1;
        }
      });

      const etiquetas = Object.keys(semanas).sort((a, b) => parseInt(a.replace("S", ""), 10) - parseInt(b.replace("S", ""), 10));
      const valores = etiquetas.map(semana => semanas[semana]);

      graficar({
        ctx: document.getElementById("chartSemanaEndoscopia").getContext("2d"),
        etiquetas,
        valores,
        tipo: "line",
        titulo: "Endoscopias por Semana",
        tipoPunto: "circle", // Círculo como marcador
        efectoPunto: "grow", // Crecer al pasar el mouse
      });
    }

    // Gráfico mensual (barras horizontales más angostas con número dentro)
    function procesarDatosMensualEndoscopia(data) {
      const meses = {};
      data.forEach(item => {
        if (item.tipo_procedimiento === 'Gastroduodenoscopia') {
          const fecha = new Date(item.fecha);
          const mes = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, "0")}`;
          meses[mes] = (meses[mes] || 0) + 1;
        }
      });

      const etiquetas = Object.keys(meses).sort();
      const valores = etiquetas.map(mes => meses[mes]);

      // Crear gráfico
      graficar({
        ctx: document.getElementById("chartMensualEndoscopia").getContext("2d"),
        etiquetas,
        valores,
        tipo: "bar",
        titulo: "Endoscopias por Mes",
        orientacion: "horizontal", // Orientación horizontal
        barraAngosta: true, // Barras más angostas
        mostrarNumeroDentro: true, // Mostrar número dentro de la barra
      });
    }

    // Gráfico trimestral (barras verticales más angostas)
    function procesarDatosTrimestreEndoscopia(data) {
      const trimestres = {};
      data.forEach(item => {
        if (item.tipo_procedimiento === 'Gastroduodenoscopia') {
          const fecha = new Date(item.fecha);
          const trimestre = obtenerTrimestre(fecha);
          trimestres[trimestre] = (trimestres[trimestre] || 0) + 1;
        }
      });

      const etiquetas = Object.keys(trimestres).sort();
      const valores = etiquetas.map(trimestre => trimestres[trimestre]);

      graficar({
        ctx: document.getElementById("chartTrimestreEndoscopia").getContext("2d"),
        etiquetas,
        valores,
        tipo: "bar",
        titulo: "Endoscopias por Trimestre",
        barraAngosta: true, // Barras más angostas
      });
    }

    // Función general para graficar
    function graficar({ ctx, etiquetas, valores, tipo, titulo, orientacion, tipoPunto, efectoPunto, barraAngosta, mostrarNumeroDentro }) {
      const colores = etiquetas.map(() => `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.6)`);

      const datasets = [{
        label: titulo,
        data: valores,
        backgroundColor: colores,
        borderColor: colores.map(color => color.replace("0.6", "1")),
        borderWidth: 1,
        pointRadius: tipoPunto === "circle" ? 5 : 0,
        hoverRadius: tipoPunto === "circle" ? 10 : 0,
      }];

      const options = {
        responsive: true,
        maintainAspectRatio: false, // Permitir ajuste de tamaño de los gráficos
        indexAxis: orientacion === "horizontal" ? "y" : "x",
        scales: {
          x: {
            beginAtZero: true,
            barThickness: barraAngosta ? 6 : 12, // Barras más angostas
          },
          y: {
            beginAtZero: true,
          },
        },
        plugins: {
          datalabels: {
            display: mostrarNumeroDentro, // Mostrar número dentro de la barra
            align: "end",
            anchor: "end",
            font: {
              weight: "bold",
            },
            color: "#fff",
          },
        },
      };

      new Chart(ctx, {
        type: tipo,
        data: {
          labels: etiquetas,
          datasets,
        },
        options,
      });
    }

    function obtenerSemanaDelAno(fecha) {
      const inicioAno = new Date(fecha.getFullYear(), 0, 1);
      const dias = Math.floor((fecha - inicioAno) / (24 * 60 * 60 * 1000));
      return `S${Math.ceil((dias + inicioAno.getDay() + 1) / 7)}`;
    }

    function obtenerTrimestre(fecha) {
      const year = fecha.getFullYear();
      const month = fecha.getMonth(); // Meses: 0-11
      const trimestre = Math.floor(month / 3) + 1;
      return `Q${trimestre} ${year}`;
    }

    obtenerDatosEndoscopia();

    // Evitar ajuste constante con debounce
    let resizeTimeout;
    window.addEventListener("resize", function() {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(function() {
        const charts = Chart.instances;
        charts.forEach(chart => chart.resize());
      }, 100);
    });
