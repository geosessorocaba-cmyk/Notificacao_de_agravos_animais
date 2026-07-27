/* ==========================================================================
   SISTEMA PRINCIPAL DE COMPORTAMENTO E INTERATIVIDADE (JS)
   NOTIFICAÇÃO DE AGRAVOS EM SAÚDE PÚBLICA (ANIMAIS)
   ========================================================================== */

// --------------------------------------------------------------------------
// NAVEGAÇÃO ENTRE AGRAVOS E SALVAMENTO PRÉVIO
// --------------------------------------------------------------------------
function irParaAgravo(paginaDestino) {
    // Garante que todos os dados do veterinário sejam salvos antes de redirecionar
    const vetFieldsKeys = ['vet_nome', 'vet_crmv', 'vet_clinica', 'vet_endereco', 'vet_telefone', 'vet_email'];
    
    vetFieldsKeys.forEach(id => {
        const field = document.getElementById(id);
        if (field) {
            localStorage.setItem(id, field.value);
        }
    });

    // Redireciona para a página do agravo selecionado
    window.location.href = paginaDestino;
}

document.addEventListener('DOMContentLoaded', () => {
    
    // --------------------------------------------------------------------------
    // 1. GERENCIAMENTO DE TEMA (CLARO / ESCURO)
    // --------------------------------------------------------------------------
    const themeBtn = document.querySelector('.theme-toggle-btn');
    const htmlElement = document.documentElement;

    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        htmlElement.setAttribute('data-theme', savedTheme);
        updateThemeIcon(savedTheme);
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        htmlElement.setAttribute('data-theme', 'dark');
        updateThemeIcon('dark');
    }

    if (themeBtn) {
        themeBtn.addEventListener('click', () => {
            const currentTheme = htmlElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

            htmlElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            updateThemeIcon(newTheme);
        });
    }

    function updateThemeIcon(theme) {
        if (themeBtn) {
            themeBtn.innerHTML = theme === 'dark' ? '☀️' : '🌙';
        }
    }

    // --------------------------------------------------------------------------
    // 2. PERSISTÊNCIA E AUTO-PREENCHIMENTO DOS 6 CAMPOS DO VETERINÁRIO
    // --------------------------------------------------------------------------
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
            // A. Carrega os dados salvos no LocalStorage
            const savedValue = localStorage.getItem(id);
            if (savedValue) {
                field.value = savedValue;
            }

            // B. Salva no LocalStorage em tempo real a cada digitação
            field.addEventListener('input', (e) => {
                localStorage.setItem(id, e.target.value);
            });
        }
    });

    // --------------------------------------------------------------------------
    // 3. GERENCIADOR DO MODAL DE CONFIRMAÇÃO (UTILIZADO NOS FORMULÁRIOS)
    // --------------------------------------------------------------------------
    const form = document.getElementById('formAgravo');
    const modal = document.getElementById('modalConfirmacao');
    const btnCancel = document.getElementById('btnModalCancel');
    const btnConfirm = document.getElementById('btnModalConfirm');

    if (form && modal) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();

            const fieldNome = document.getElementById('vet_nome');
            const fieldCrmv = document.getElementById('vet_crmv');
            const fieldClinica = document.getElementById('vet_clinica');

            const nomeVet = fieldNome && fieldNome.value.trim() !== '' ? fieldNome.value : 'Não informado';
            const crmvVet = fieldCrmv && fieldCrmv.value.trim() !== '' ? fieldCrmv.value : 'Não informado';
            const clinicaVet = fieldClinica && fieldClinica.value.trim() !== '' ? fieldClinica.value : 'Não informado';

            const elemModalNome = document.getElementById('modalVetNome');
            const elemModalCrmv = document.getElementById('modalVetCrmv');
            const elemModalClinica = document.getElementById('modalVetClinica');

            if (elemModalNome) elemModalNome.textContent = nomeVet;
            if (elemModalCrmv) elemModalCrmv.textContent = crmvVet;
            if (elemModalClinica) elemModalClinica.textContent = clinicaVet;

            modal.style.display = 'flex';
        });

        if (btnCancel) {
            btnCancel.addEventListener('click', () => {
                modal.style.display = 'none';
            });
        }

        if (btnConfirm) {
            btnConfirm.addEventListener('click', () => {
                btnConfirm.disabled = true;
                btnConfirm.textContent = 'Enviando...';
                form.submit();
            });
        }

        window.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    }
});
