import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase
const supabaseUrl = 'https://zlsweremfwlrnkjnpnoj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpsc3dlcmVtZndscm5ram5wbm9qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY3Nzk1NDQsImV4cCI6MjA1MjM1NTU0NH0.dqnPO5OajQlxxt5gze_uiJk3xDifbNqXtgMP_P4gRR4';
const supabase = createClient(supabaseUrl, supabaseKey);

// Función para obtener datos
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
