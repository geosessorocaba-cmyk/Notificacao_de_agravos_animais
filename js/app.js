document.addEventListener('DOMContentLoaded', () => {
    carregarDadosVet();
});

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
        nome: document.getElementById('vet_nome').value,
        crmv: document.getElementById('vet_crmv').value,
        clinica: document.getElementById('vet_clinica').value,
        endereco: document.getElementById('vet_endereco').value,
        telefone: document.getElementById('vet_telefone').value,
        email: document.getElementById('vet_email').value
    };
    localStorage.setItem('vetData_sorocaba', JSON.stringify(vetData));
}

function irParaAgravo(pagina) {
    const nome = document.getElementById('vet_nome').value;
    const crmv = document.getElementById('vet_crmv').value;
    if (!nome || !crmv) {
        alert("Preencha Nome e CRMV antes de avançar.");
        return;
    }
    salvarDadosVet();
    window.location.href = pagina;
}
