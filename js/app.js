/* ==========================================================================
   SISTEMA PRINCIPAL DE COMPORTAMENTO E INTERATIVIDADE (JS)
   NOTIFICAÇÃO DE AGRAVOS EM SAÚDE PÚBLICA (ANIMAIS)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    
    // --------------------------------------------------------------------------
    // 1. GERENCIAMENTO DE TEMA (CLARO / ESCURO)
    // --------------------------------------------------------------------------
    const themeBtn = document.querySelector('.theme-toggle-btn');
    const htmlElement = document.documentElement;

    // A. Verifica o tema salvo anteriormente ou a preferência do sistema do usuário
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        htmlElement.setAttribute('data-theme', savedTheme);
        updateThemeIcon(savedTheme);
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        htmlElement.setAttribute('data-theme', 'dark');
        updateThemeIcon('dark');
    }

    // B. Alterna o tema ao clicar no botão da lâmpada
    if (themeBtn) {
        themeBtn.addEventListener('click', () => {
            const currentTheme = htmlElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

            htmlElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            updateThemeIcon(newTheme);
        });
    }

    // C. Atualiza o ícone do botão com base no tema ativo
    function updateThemeIcon(theme) {
        if (themeBtn) {
            themeBtn.innerHTML = theme === 'dark' ? '☀️' : '🌙';
        }
    }

    // --------------------------------------------------------------------------
    // 2. PERSISTÊNCIA E AUTO-PREENCHIMENTO (DADOS DO VETERINÁRIO)
    // --------------------------------------------------------------------------
    // Mapeamento dos campos fixos de identificação do profissional
    const vetFields = {
        nome: document.getElementById('vetNome'),
        crmv: document.getElementById('vetCrmv'),
        clinica: document.getElementById('vetClinica'),
        telefone: document.getElementById('vetTelefone'),
        email: document.getElementById('vetEmail')
    };

    // Itera sobre cada campo mapeado para aplicar as lógicas de salvamento
    Object.keys(vetFields).forEach(key => {
        const field = vetFields[key];
        
        if (field) {
            // A. Carrega os dados salvos no LocalStorage ao abrir a página
            const savedValue = localStorage.getItem(`vet_${key}`);
            if (savedValue) {
                field.value = savedValue;
            }

            // B. Salva os dados automaticamente no dispositivo a cada tecla digitada (Input)
            field.addEventListener('input', (e) => {
                localStorage.setItem(`vet_${key}`, e.target.value);
            });
        }
    });

    // --------------------------------------------------------------------------
    // 3. GERENCIADOR DO MODAL DE CONFIRMAÇÃO DE DADOS
    // --------------------------------------------------------------------------
    const form = document.getElementById('formAgravo');
    const modal = document.getElementById('modalConfirmacao');
    const btnCancel = document.getElementById('btnModalCancel');
    const btnConfirm = document.getElementById('btnModalConfirm');

    if (form && modal) {
        // A. Intercepta o clique em "Enviar Notificação"
        form.addEventListener('submit', (e) => {
            e.preventDefault(); // Impede o envio imediato

            // B. Captura os valores atuais ou define como "Não informado"
            const nomeVet = vetFields.nome && vetFields.nome.value.trim() !== '' ? vetFields.nome.value : 'Não informado';
            const crmvVet = vetFields.crmv && vetFields.crmv.value.trim() !== '' ? vetFields.crmv.value : 'Não informado';
            const clinicaVet = vetFields.clinica && vetFields.clinica.value.trim() !== '' ? vetFields.clinica.value : 'Não informado';

            // C. Injeta os valores capturados nos textos do Modal
            document.getElementById('modalVetNome').textContent = nomeVet;
            document.getElementById('modalVetCrmv').textContent = crmvVet;
            document.getElementById('modalVetClinica').textContent = clinicaVet;

            // D. Exibe o Modal na tela
            modal.style.display = 'flex';
        });

        // E. Lógica do Botão Cancelar (Retorna ao formulário)
        if (btnCancel) {
            btnCancel.addEventListener('click', () => {
                modal.style.display = 'none';
            });
        }

        // F. Lógica do Botão Confirmar (Efetua o envio real)
        if (btnConfirm) {
            btnConfirm.addEventListener('click', () => {
                // Trava o botão para evitar múltiplos cliques / envios duplicados
                btnConfirm.disabled = true;
                btnConfirm.textContent = 'Enviando...';
                
                // Dispara o envio do formulário
                form.submit();
            });
        }

        // G. Fecha o modal caso o usuário clique fora da caixa branca (no overlay escuro)
        window.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    }
});
