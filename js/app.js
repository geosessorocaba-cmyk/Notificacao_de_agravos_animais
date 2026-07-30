/* ==========================================================================
   SISTEMA PRINCIPAL DE COMPORTAMENTO E INTERATIVIDADE (JS)
   NOTIFICAÇÃO DE AGRAVOS EM SAÚDE PÚBLICA (ANIMAIS)
   ========================================================================== */

// 1. ALTERNÂNCIA DE TEMA (MODO ESCURO / CLARO)
window.toggleDarkMode = function() {
    const htmlElement = document.documentElement;
    const currentTheme = htmlElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    htmlElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    const themeIcon = document.getElementById('theme-icon');
    if (themeIcon) {
        themeIcon.textContent = newTheme === 'dark' ? '☀️' : '🌙';
    }
};


// ==========================================================================
// MÁSCARAS E VALIDAÇÕES DE INPUT
// ==========================================================================

function aplicarMascaras() {
    // 1. Máscara para CPF (000.000.000-00)
    const cpfs = document.querySelectorAll('#tutor_cpf');
    cpfs.forEach(input => {
        input.addEventListener('input', (e) => {
            let v = e.target.value.replace(/\D/g, ""); // Remove tudo o que não for número
            if (v.length > 11) v = v.slice(0, 11); // Limita a 11 dígitos
            v = v.replace(/(\d{3})(\d)/, "$1.$2");
            v = v.replace(/(\d{3})(\d)/, "$1.$2");
            v = v.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
            e.target.value = v;
        });
    });

    // 2. Máscara para Telefones: (00) 00000-0000 ou (00) 0000-0000
    const telefones = document.querySelectorAll('input[type="tel"]');
    telefones.forEach(input => {
        input.addEventListener('input', (e) => {
            let v = e.target.value.replace(/\D/g, "");
            if (v.length > 11) v = v.slice(0, 11);
            v = v.replace(/^(\d{2})(\d)/g, "($1) $2");
            v = v.replace(/(\d)(\d{4})$/, "$1-$2");
            e.target.value = v;
        });
    });

    // 3. Bloqueio total de letras (Apenas Números) para CRMV e Número da Casa
    const numerosGerais = document.querySelectorAll('#vet_crmv, #tutor_numero');
    numerosGerais.forEach(input => {
        input.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/\D/g, "");
        });
    });
}

// 2. INICIALIZAÇÃO DA PÁGINA E RECUPERAÇÃO DE DADOS
document.addEventListener('DOMContentLoaded', () => {
    
    // Ativa as máscaras em todos os campos assim que a página carregar
    aplicarMascaras(); 
    
    // Restaura o tema salvo
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
        const themeIcon = document.getElementById('theme-icon');
        if (themeIcon) {
            themeIcon.textContent = savedTheme === 'dark' ? '☀️' : '🌙';
        }
    }

    // Lógica de Autopreenchimento Inteligente
    const vetSalvo = localStorage.getItem('vetNotificante');
    if (vetSalvo) {
        try {
            const vet = JSON.parse(vetSalvo);
            
            // Verifica se a página foi chamada com a instrução de autopreenchimento (Ex: veio de "Outro Agravo")
            const urlParams = new URLSearchParams(window.location.search);
            const shouldAutofill = urlParams.get('autofill') === 'true';

            if (shouldAutofill) {
                preencherCamposVet(vet);
            }

            // Monitora o campo CRMV para autocompletar quando o usuário digitar o 2º campo
            const crmvInput = document.getElementById('vet_crmv');
            if (crmvInput) {
                const verificarEPreencher = (e) => {
                    const crmvDigitado = e.target.value.trim();
                    // Só autocompleta se o CRMV digitado for exatamente o mesmo que está no LocalStorage
                    if (crmvDigitado !== '' && crmvDigitado === vet.crmv) {
                        preencherCamposVet(vet);
                    }
                };
                
                // Dispara a verificação enquanto digita ou ao sair do campo
                crmvInput.addEventListener('input', verificarEPreencher);
                crmvInput.addEventListener('blur', verificarEPreencher);
            }
        } catch (e) {
            console.error("Erro ao carregar dados salvos do veterinário:", e);
        }
    }
});

// Função auxiliar para preencher os dados
function preencherCamposVet(vet) {
    if (document.getElementById('vet_nome') && !document.getElementById('vet_nome').value) document.getElementById('vet_nome').value = vet.nome || '';
    if (document.getElementById('vet_crmv') && !document.getElementById('vet_crmv').value) document.getElementById('vet_crmv').value = vet.crmv || '';
    if (document.getElementById('vet_clinica')) document.getElementById('vet_clinica').value = vet.clinica || '';
    if (document.getElementById('vet_endereco')) document.getElementById('vet_endereco').value = vet.endereco || '';
    if (document.getElementById('vet_telefone')) document.getElementById('vet_telefone').value = vet.telefone || '';
    if (document.getElementById('vet_email')) document.getElementById('vet_email').value = vet.email || '';
}

// 3. FUNÇÃO GLOBAL PARA NAVEGAR E SALVAR DADOS DO VETERINÁRIO
window.irParaAgravo = function(paginaDestino) {
    const vetNome = document.getElementById('vet_nome')?.value.trim() || '';
    const vetCrmv = document.getElementById('vet_crmv')?.value.trim() || '';
    const vetClinica = document.getElementById('vet_clinica')?.value.trim() || '';
    const vetEndereco = document.getElementById('vet_endereco')?.value.trim() || '';
    const vetTelefone = document.getElementById('vet_telefone')?.value.trim() || '';
    const vetEmail = document.getElementById('vet_email')?.value.trim() || '';

    // Validação dos campos obrigatórios do veterinário
    if (!vetNome || !vetCrmv || !vetTelefone || !vetEmail) {
        alert("Por favor, preencha os campos obrigatórios do Médico Veterinário (Nome, CRMV, Telefone e E-mail) antes de prosseguir.");
        return;
    }

    // Grava no LocalStorage
    const dadosVet = {
        nome: vetNome,
        crmv: vetCrmv,
        clinica: vetClinica,
        endereco: vetEndereco,
        telefone: vetTelefone,
        email: vetEmail
    };

    localStorage.setItem('vetNotificante', JSON.stringify(dadosVet));

    // Redireciona para a página correspondente
    window.location.href = paginaDestino;
};
