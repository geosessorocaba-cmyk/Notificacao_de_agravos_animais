/* ==========================================================================
   SISTEMA DE INTERAÇÃO (JAVASCRIPT)
   NOTIFICAÇÃO DE AGRAVOS EM SAÚDE PÚBLICA (ANIMAIS)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    
    /* --------------------------------------------------------------------------
       1. GERENCIAMENTO DE TEMA (CLARO / ESCURO)
       -------------------------------------------------------------------------- */
    const themeToggleBtn = document.getElementById('themeToggle');
    const rootElement = document.documentElement;
    const themeIcon = themeToggleBtn.querySelector('i') || themeToggleBtn; // Caso use ícone de fonte ou emoji

    // Verifica a preferência salva no LocalStorage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        rootElement.setAttribute('data-theme', 'dark');
        themeIcon.innerHTML = '☀️'; // Ícone para mudar para modo claro
    } else {
        themeIcon.innerHTML = '🌙'; // Ícone para mudar para modo escuro
    }

    // Alterna o tema ao clicar
    themeToggleBtn.addEventListener('click', () => {
        const currentTheme = rootElement.getAttribute('data-theme');
        if (currentTheme === 'dark') {
            rootElement.removeAttribute('data-theme');
            localStorage.setItem('theme', 'light');
            themeIcon.innerHTML = '🌙';
        } else {
            rootElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
            themeIcon.innerHTML = '☀️';
        }
    });


    /* --------------------------------------------------------------------------
       2. NAVEGAÇÃO ENTRE MENU DE AGRAVOS E FORMULÁRIO
       -------------------------------------------------------------------------- */
    const btnAgravos = document.querySelectorAll('.btn-agravo');
    const menuSection = document.getElementById('menuAgravos');
    const formSection = document.getElementById('formContainer');
    const notificacaoForm = document.getElementById('notificacaoForm');
    const btnVoltar = document.getElementById('btnVoltar');
    
    // Elementos visuais dinâmicos
    const headerAgravoBadge = document.getElementById('headerAgravoBadge');
    const inputAgravoOculto = document.getElementById('agravoSelecionado'); // Input hidden no form

    // Ao clicar em um agravo no menu principal
    btnAgravos.forEach(btn => {
        btn.addEventListener('click', (e) => {
            // Pega os dados do botão (requer data-agravo="nome" no HTML)
            const agravoId = e.currentTarget.getAttribute('data-agravo');
            const agravoNome = e.currentTarget.querySelector('span').innerText;

            // Atualiza o formulário com o agravo selecionado
            if (inputAgravoOculto) inputAgravoOculto.value = agravoId;
            
            // Atualiza o badge no cabeçalho (se existir)
            if (headerAgravoBadge) {
                headerAgravoBadge.innerText = agravoNome;
                headerAgravoBadge.style.display = 'inline-block';
            }

            // Esconde o menu e mostra o formulário
            menuSection.style.display = 'none';
            formSection.style.display = 'block';
            
            // Rola a página para o topo suavemente
            window.scrollTo({ top: 0, behavior: 'smooth' });

            // (Opcional) Chamar função para exibir/ocultar campos específicos por agravo
            configurarCamposPorAgravo(agravoId);
        });
    });

    // Botão Voltar (cancela a notificação atual)
    if (btnVoltar) {
        btnVoltar.addEventListener('click', (e) => {
            e.preventDefault();
            if(confirm('Tem certeza que deseja voltar? Os dados preenchidos serão perdidos.')) {
                formSection.style.display = 'none';
                menuSection.style.display = 'block';
                if (headerAgravoBadge) headerAgravoBadge.style.display = 'none';
                notificacaoForm.reset();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
    }

    /* --------------------------------------------------------------------------
       3. LÓGICA DE CAMPOS DINÂMICOS (EX: MOSTRAR DATA DE ÓBITO)
       -------------------------------------------------------------------------- */
    function configurarCamposPorAgravo(agravoId) {
        // Exemplo: Mostrar campos específicos dependendo da doença
        // Você pode ocultar/exibir divs do HTML baseadas nessa variável
        console.log(`Configurando formulário para: ${agravoId}`);
    }

    // Exemplo genérico: Se marcar "Óbito", exige a "Data do Óbito"
    const selectObito = document.getElementById('obitoAnimal');
    const containerDataObito = document.getElementById('containerDataObito');
    const inputDataObito = document.getElementById('dataObito');

    if (selectObito && containerDataObito) {
        selectObito.addEventListener('change', (e) => {
            if (e.target.value === 'sim') {
                containerDataObito.style.display = 'block';
                if(inputDataObito) inputDataObito.setAttribute('required', 'required');
            } else {
                containerDataObito.style.display = 'none';
                if(inputDataObito) {
                    inputDataObito.removeAttribute('required');
                    inputDataObito.value = ''; // Limpa o campo
                }
            }
        });
    }

    /* --------------------------------------------------------------------------
       4. MODAL DE CONFIRMAÇÃO E INTERCEPTAÇÃO DE ENVIO
       -------------------------------------------------------------------------- */
    const modalOverlay = document.getElementById('confirmModal');
    const modalContentData = document.getElementById('modalContentData');
    const btnModalCancel = document.getElementById('btnCancelar');
    const btnModalConfirm = document.getElementById('btnConfirmar');

    if (notificacaoForm && modalOverlay) {
        notificacaoForm.addEventListener('submit', (e) => {
            e.preventDefault(); // Impede o envio padrão

            // Validação nativa do HTML5
            if (!notificacaoForm.checkValidity()) {
                notificacaoForm.reportValidity();
                return;
            }

            // Coleta os dados do formulário
            const formData = new FormData(notificacaoForm);
            modalContentData.innerHTML = ''; // Limpa o modal anterior

            // Constrói o resumo dos dados para o Modal
            let summaryHTML = '<div class="modal-info-box">';
            
            for (let [key, value] of formData.entries()) {
                // Ignora campos vazios ou de controle interno
                if (value.trim() !== '' && key !== 'agravoSelecionado') {
                    // Formata a chave (Ex: nomeTutor -> Nome Tutor)
                    const formattedKey = key
                        .replace(/([A-Z])/g, ' $1')
                        .replace(/^./, str => str.toUpperCase())
                        .replace(/_/g, ' ');

                    summaryHTML += `
                        <div class="modal-info-row">
                            <span class="modal-info-label">${formattedKey}</span>
                            <span class="modal-info-value">${value}</span>
                        </div>
                    `;
                }
            }
            summaryHTML += '</div>';
            modalContentData.innerHTML = summaryHTML;

            // Exibe o modal
            modalOverlay.style.display = 'flex';
        });
    }

    // Botão Cancelar dentro do Modal
    if (btnModalCancel) {
        btnModalCancel.addEventListener('click', () => {
            modalOverlay.style.display = 'none';
        });
    }

    // Botão Confirmar dentro do Modal (Envio Final)
    if (btnModalConfirm) {
        btnModalConfirm.addEventListener('click', () => {
            const originalText = btnModalConfirm.innerText;
            btnModalConfirm.innerText = 'Enviando...';
            btnModalConfirm.disabled = true;
            btnModalCancel.disabled = true;

            // ====================================================================
            // AQUI ENTRA A INTEGRAÇÃO COM O BACKEND / PLANILHA / GOOGLE FORMS
            // Como exemplo, estamos usando um timeout para simular o envio.
            // Para integrar de verdade, você usaria fetch() ou XMLHttpRequest aqui.
            // ====================================================================
            
            setTimeout(() => {
                alert('Notificação enviada com sucesso à Unidade de Vigilância de Zoonoses!');
                
                // Restaura o estado da interface
                modalOverlay.style.display = 'none';
                btnModalConfirm.innerText = originalText;
                btnModalConfirm.disabled = false;
                btnModalCancel.disabled = false;
                
                // Retorna ao menu inicial e limpa o formulário
                notificacaoForm.reset();
                formSection.style.display = 'none';
                menuSection.style.display = 'block';
                if (headerAgravoBadge) headerAgravoBadge.style.display = 'none';
                window.scrollTo({ top: 0, behavior: 'smooth' });
                
            }, 1500); // Simula 1,5s de carregamento
        });
    }
});
