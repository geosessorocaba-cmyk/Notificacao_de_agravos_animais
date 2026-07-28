/* ==========================================================================
   LÓGICA GLOBAL - MODO ESCURO E LOCALSTORAGE
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    carregarTema();
    carregarDadosVet();
});

// 1. Gerenciamento de Tema (Modo Claro / Modo Escuro)
function carregarTema() {
    const temaSalvo = localStorage.getItem('theme_sorocaba') || 'light';
    document.documentElement.setAttribute('data-theme', temaSalvo);
    atualizarIconeTema(temaSalvo);
}

function toggleDarkMode() {
    const temaAtual = document.documentElement.getAttribute('data-theme');
    const novoTema = temaAtual === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', novoTema);
    localStorage.setItem('theme_sorocaba', novoTema);
    atualizarIconeTema(novoTema);
}

function atualizarIconeTema(tema) {
    const btnIcon = document.getElementById('theme-icon');
    if (btnIcon) {
        // Lâmpada Acesa (💡) no modo claro / Lâmpada Apagada (🔌 ou 🌙) no modo escuro
        btnIcon.textContent = tema === 'dark' ? '💡' : '🌙';
        btnIcon.title = tema === 'dark' ? 'Mudar para Modo Claro' : 'Mudar para Modo Escuro';
    }
}

// 2. Gerenciamento de Dados do Veterinário Notificante (localStorage)
function carregarDadosVet() {
    const vet = JSON.parse(localStorage.getItem('vetData_sorocaba')) || {};
    if (document.getElementById('vet_nome')) document.getElementById('vet_nome').value = vet.nome || '';
    if (document.getElementById('vet_crmv')) document.getElementById('vet_crmv').value = vet.crmv || '';
    if (document.getElementById('vet_clinica')) document.getElementById('vet_clinica').value = vet.clinica || '';
    if (document.getElementById('vet_endereco')) document.getElementById('vet_endereco').value = vet.endereco || '';
    if (document.getElementById('vet_telefone')) document.getElementById('vet_telefone').value = vet.telefone || '';
    if (document.getElementById('vet_email')) document.getElementById('vet_email').value = vet.email || '';
}

function salvarDadosVet() {
    const vetData = {
        nome: document.getElementById('vet_nome').value.trim(),
        crmv: document.getElementById('vet_crmv').value.trim(),
        clinica: document.getElementById('vet_clinica').value.trim(),
        endereco: document.getElementById('vet_endereco').value.trim(),
        telefone: document.getElementById('vet_telefone').value.trim(),
        email: document.getElementById('vet_email').value.trim()
    };
    localStorage.setItem('vetData_sorocaba', JSON.stringify(vetData));
}

function irParaAgravo(pagina) {
    const nome = document.getElementById('vet_nome').value.trim();
    const crmv = document.getElementById('vet_crmv').value.trim();
    const telefone = document.getElementById('vet_telefone').value.trim();
    const email = document.getElementById('vet_email').value.trim();

    if (!nome || !crmv || !telefone || !email) {
        alert("Por favor, preencha todos os campos obrigatórios do Médico Veterinário (Nome, CRMV, Telefone e E-mail) antes de avançar.");
        return;
    }
    salvarDadosVet();
    window.location.href = pagina;
}
