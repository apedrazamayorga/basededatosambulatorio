import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase
const supabaseUrl = 'https://zlsweremfwlrnkjnpnoj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpsc3dlcmVtZndscm5ram5wbm9qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY3Nzk1NDQsImV4cCI6MjA1MjM1NTU0NH0.dqnPO5OajQlxxt5gze_uiJk3xDifbNqXtgMP_P4gRR4';
const supabase = createClient(supabaseUrl, supabaseKey);

async function fetchData() {
  const { data, error } = await supabase
    .from('nombre_de_tu_tabla')
    .select('*');

  if (error) {
    console.error('Error al obtener datos:', error);
    return [];
  }

  return data;
}

async function createChart() {
  const data = await fetchData();
  const labels = data.map(item => item.nombre_columna_x); // Cambia por tu columna
  const values = data.map(item => item.nombre_columna_y); // Cambia por tu columna

  const ctx = document.getElementById('myChart').getContext('2d');
  new Chart(ctx, {
    type: 'bar', // Cambia a 'line', 'pie', etc. según tu necesidad
    data: {
      labels: labels,
      datasets: [{
        label: 'Mi Gráfica',
        data: values,
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1
      }]
    },
    options: {
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
}

createChart();
