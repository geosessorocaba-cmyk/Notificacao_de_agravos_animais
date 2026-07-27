/* ==========================================================================
   SISTEMA PRINCIPAL DE COMPORTAMENTO E INTERATIVIDADE (JS)
   NOTIFICAÇÃO DE AGRAVOS EM SAÚDE PÚBLICA (ANIMAIS)
   ========================================================================== */

let urlDestinoAgravo = '';

document.addEventListener('DOMContentLoaded', () => {
    carregarTema();
    configurarPreenchimentoAutomatico();
    configurarModalConfirmacao();
});

/* --------------------------------------------------------------------------
   1. GERENCIAMENTO DE TEMA (MODO CLARO E MODO ESCURO)
   -------------------------------------------------------------------------- */
function carregarTema() {
    // Busca o tema salvo no navegador (ou define 'light' como padrão)
    const temaSalvo = localStorage.getItem('theme_sorocaba') || 'light';
    document.documentElement.setAttribute('data-theme', temaSalvo);
    atualizarIconeTema(temaSalvo);

    // Adiciona o evento de clique ao botão do tema
    const themeBtn = document.querySelector('.theme-toggle-btn');
    if (themeBtn) {
        themeBtn.addEventListener('click', toggleDarkMode);
    }
}

function toggleDarkMode() {
    const temaAtual = document.documentElement.getAttribute('data-theme');
    const novoTema = temaAtual === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', novoTema);
    localStorage.setItem('theme_sorocaba', novoTema);
    atualizarIconeTema(novoTema);
}

function atualizarIconeTema(tema) {
    const themeBtn = document.querySelector('.theme-toggle-btn');
    if (themeBtn) {
        // Lâmpada acesa no modo escuro, lua no modo claro
        themeBtn.textContent = tema === 'dark' ? '💡' : '🌙';
    }
}

/* --------------------------------------------------------------------------
   2. AUTO-PREENCHIMENTO E PERSISTÊNCIA DOS DADOS DO VETERINÁRIO
   -------------------------------------------------------------------------- */
function configurarPreenchimentoAutomatico() {
    // IDs exatos dos 6 campos da página inicial
    const vetFieldsIds = [
        'vet_nome',
        'vet_crmv',
        'vet_clinica',
        'vet_endereco',
        'vet_telefone',
        'vet_email'
    ];

    vetFieldsIds.forEach(id => {
        const field = document.getElementById(id);
        
        if (field) {
            // A. Quando a página carrega, preenche com os dados salvos
            const savedValue = localStorage.getItem(id);
            if (savedValue) {
                field.value = savedValue;
            }

            // B. Salva no navegador em tempo real a cada tecla digitada
            field.addEventListener('input', (e) => {
                localStorage.setItem(id, e.target.value);
            });
        }
    });
}

/* --------------------------------------------------------------------------
   3. NAVEGAÇÃO PARA OS AGRAVOS COM VALIDAÇÃO (PÁGINA INICIAL)
   -------------------------------------------------------------------------- */
window.irParaAgravo = function(paginaDestino) {
    // Coleta os valores atuais dos campos obrigatórios
    const fieldNome = document.getElementById('vet_nome');
    const fieldCrmv = document.getElementById('vet_crmv');
    const fieldTelefone = document.getElementById('vet_telefone');
    const fieldEmail = document.getElementById('vet_email');
    const fieldClinica = document.getElementById('vet_clinica');

    // Validação de segurança para garantir que o médico se identifique
    if (!fieldNome?.value.trim() || !fieldCrmv?.value.trim() || !fieldTelefone?.value.trim() || !fieldEmail?.value.trim()) {
        alert("Por favor, preencha todos os campos obrigatórios (*) do Médico Veterinário para prosseguir com a notificação.");
        return;
    }

    // Salva a URL para onde vamos redirecionar após a confirmação
    urlDestinoAgravo = paginaDestino;
    
    // Injeta os dados no Modal de Confirmação
    const modalNome = document.getElementById('modal-nome-vet');
    const modalCrmv = document.getElementById('modal-crmv-vet');
    const modalClinica = document.getElementById('modal-clinica-vet');

    if (modalNome) modalNome.textContent = fieldNome.value.trim();
    if (modalCrmv) modalCrmv.textContent = fieldCrmv.value.trim();
    if (modalClinica) modalClinica.textContent = fieldClinica?.value.trim() || 'Não informada';
    
    // Exibe o modal na tela
    const modal = document.getElementById('modal-confirmacao');
    if (modal) {
        modal.style.display = 'flex';
    } else {
        // Fallback caso o modal não exista na tela (vai direto)
        window.location.href = urlDestinoAgravo;
    }
};

/* --------------------------------------------------------------------------
   4. CONTROLE DO MODAL DE CONFIRMAÇÃO
   -------------------------------------------------------------------------- */
function configurarModalConfirmacao() {
    const btnCancel = document.querySelector('.btn-modal-cancel');
    const btnConfirm = document.querySelector('.btn-modal-confirm');
    const modal = document.getElementById('modal-confirmacao');

    // Fechar o modal ao clicar em "Corrigir Dados"
    if (btnCancel) {
        btnCancel.addEventListener('click', () => {
            if (modal) modal.style.display = 'none';
        });
    }

    // Confirmar e avançar para a página do Agravo
    if (btnConfirm) {
        btnConfirm.addEventListener('click', () => {
            // Um último reforço para garantir que os dados estão no LocalStorage
            const vetFieldsIds = ['vet_nome', 'vet_crmv', 'vet_clinica', 'vet_endereco', 'vet_telefone', 'vet_email'];
            vetFieldsIds.forEach(id => {
                const field = document.getElementById(id);
                if (field) {
                    localStorage.setItem(id, field.value);
                }
            });

            // Redireciona para o arquivo selecionado (ex: esporotricose.html)
            window.location.href = urlDestinoAgravo;
        });
    }

    // Fechar o modal ao clicar fora da caixa branca (no fundo escuro)
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
}
