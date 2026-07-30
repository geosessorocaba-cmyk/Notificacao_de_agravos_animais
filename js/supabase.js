// js/supabase.js

// 1. URL e Chave Pública do seu projeto Supabase
const supabaseUrl = 'https://iwohicnazfxtysetelpz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml3b2hpY25hemZ4dHlzZXRlbHB6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ5MDgyNzYsImV4cCI6MjEwMDQ4NDI3Nn0.x8QrBDzCV-qqhkv7zLZYB7FH04NT6CKOcjQOio9TglI';

// 2. Cria a variável global 'supabase' que o app.js vai usar
const supabase = supabase.createClient(supabaseUrl, supabaseKey);
