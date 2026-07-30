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
            let v = e.target.value.replace(/\D/g, ""); 
            if (v.length > 11) v = v.slice(0, 11); 
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

// ==========================================================================
// 2. INICIALIZAÇÃO DA PÁGINA E RECUPERAÇÃO DE DADOS
// ==========================================================================
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
            
            // Verifica se a página foi chamada com a instrução de autopreenchimento
            const urlParams = new URLSearchParams(window.location.search);
            const shouldAutofill = urlParams.get('autofill') === 'true';

            if (shouldAutofill) {
                preencherCamposVet(vet);
            }

            // Monitora o campo CRMV para autocompletar
            const crmvInput = document.getElementById('vet_crmv');
            if (crmvInput) {
                const verificarEPreencher = (e) => {
                    const crmvDigitado = e.target.value.trim();
                    if (crmvDigitado !== '' && crmvDigitado === vet.crmv) {
                        preencherCamposVet(vet);
                    }
                };
                
                crmvInput.addEventListener('input', verificarEPreencher);
                crmvInput.addEventListener('blur', verificarEPreencher);
            }
        } catch (e) {
            console.error("Erro ao carregar dados salvos do veterinário:", e);
        }
    }

    // --- NOVA INTEGRAÇÃO: ENVIO PARA O SUPABASE AO SUBMETER O FORMULÁRIO ---
    const formEsporotricose = document.getElementById('form-esporotricose');

    if (formEsporotricose) {
        formEsporotricose.addEventListener('submit', async (e) => {
            e.preventDefault();

            const btnSubmit = formEsporotricose.querySelector('button[type="submit"]');
            const textoOriginalBtn = btnSubmit ? btnSubmit.innerText : 'Enviar';

            try {
                // Bloqueia o botão
                if (btnSubmit) {
                    btnSubmit.disabled = true;
                    btnSubmit.innerText = 'Enviando notificação...';
                }

                // Coleta os locais das lesões em formato Array
                const locaisLesoesChecked = Array.from(
                    document.querySelectorAll('input[name="locais_lesoes"]:checked')
                ).map(cb => cb.value);

                // Recupera os dados do veterinário salvos pela função irParaAgravo()
                const vetDados = JSON.parse(localStorage.getItem('vetNotificante')) || {};

                // Estrutura o payload exatamente como a sua função SQL exige
                const payload = {
                    p_numero_notificacao: document.getElementById('numero_notificacao')?.value || `ESP-${Date.now()}`,
                    p_agravo: 'Esporotricose',
                    p_ano: new Date().getFullYear(),

                    p_vet_nome: vetDados.nome || document.getElementById('vet_nome')?.value || '',
                    p_vet_crmv: vetDados.crmv || document.getElementById('vet_crmv')?.value || '',
                    p_vet_clinica: vetDados.clinica || document.getElementById('vet_clinica')?.value || '',
                    p_vet_endereco: vetDados.endereco || document.getElementById('vet_endereco')?.value || '',
                    p_vet_telefone: vetDados.telefone || document.getElementById('vet_telefone')?.value || '',
                    p_vet_email: vetDados.email || document.getElementById('vet_email')?.value || '',

                    p_tutor_nome: document.getElementById('tutor_nome')?.value || '',
                    p_tutor_cpf: document.getElementById('tutor_cpf')?.value || '',
                    p_tutor_telefone: document.getElementById('tutor_telefone')?.value || '',
                    p_tutor_endereco: document.getElementById('tutor_endereco')?.value || '',
                    p_tutor_numero: document.getElementById('tutor_numero')?.value || '',
                    p_tutor_complemento: document.getElementById('tutor_complemento')?.value || '',
                    p_tutor_bairro: document.getElementById('tutor_bairro')?.value || '',
                    p_tutor_municipio: document.getElementById('tutor_municipio')?.value || 'Sorocaba',

                    p_animal_nome: document.getElementById('animal_nome')?.value || '',
                    p_animal_especie: document.getElementById('animal_especie')?.value || '',
                    p_animal_raca: document.getElementById('animal_raca')?.value || '',
                    p_animal_sexo: document.getElementById('animal_sexo')?.value || '',
                    p_animal_idade: document.getElementById('animal_idade')?.value || '',

                    p_distribuicao_lesoes: document.querySelector('input[name="distribuicao_lesoes"]:checked')?.value || '',
                    p_locais_lesoes: locaisLesoesChecked, 
                    p_humanos_com_lesoes: document.querySelector('input[name="humanos_com_lesoes"]:checked')?.value || '',
                    p_outros_animais_com_lesoes: document.querySelector('input[name="outros_animais_com_lesoes"]:checked')?.value || '',
                    p_coleta_amostra: document.querySelector('input[name="coleta_amostra"]:checked')?.value || '',
                    p_tratamento_iniciado: document.querySelector('input[name="tratamento_iniciado"]:checked')?.value || '',
                    p_tratamento_detalhes: document.getElementById('tratamento_detalhes')?.value || '',
                    p_observacoes: document.getElementById('observacoes')?.value || ''
                };

                // Chamada RPC do Supabase
                const { data, error } = await supabase.rpc('inserir_notificacao_esporotricose_acid', payload);

                if (error) {
                    throw new Error(error.message);
                }

                if (data && data.status === 'sucesso') {
                    alert(`Sucesso! Notificação registrada sob ID: ${data.notificacao_id}`);
                    formEsporotricose.reset();
                    // Opcional: window.location.href = 'index.html';
                } else {
                    alert(`Atenção: ${data?.mensagem || 'Erro desconhecido.'}`);
                }

            } catch (err) {
                console.error('Erro na gravação:', err);
                alert(`Falha ao registrar notificação: ${err.message}`);
            } finally {
                // Restaura o botão
                if (btnSubmit) {
                    btnSubmit.disabled = false;
                    btnSubmit.innerText = textoOriginalBtn;
                }
            }
        });
    }
});

// ==========================================================================
// 3. FUNÇÕES AUXILIARES E GLOBAIS
// ==========================================================================

function preencherCamposVet(vet) {
    if (document.getElementById('vet_nome') && !document.getElementById('vet_nome').value) document.getElementById('vet_nome').value = vet.nome || '';
    if (document.getElementById('vet_crmv') && !document.getElementById('vet_crmv').value) document.getElementById('vet_crmv').value = vet.crmv || '';
    if (document.getElementById('vet_clinica')) document.getElementById('vet_clinica').value = vet.clinica || '';
    if (document.getElementById('vet_endereco')) document.getElementById('vet_endereco').value = vet.endereco || '';
    if (document.getElementById('vet_telefone')) document.getElementById('vet_telefone').value = vet.telefone || '';
    if (document.getElementById('vet_email')) document.getElementById('vet_email').value = vet.email || '';
}

window.irParaAgravo = function(paginaDestino) {
    const vetNome = document.getElementById('vet_nome')?.value.trim() || '';
    const vetCrmv = document.getElementById('vet_crmv')?.value.trim() || '';
    const vetClinica = document.getElementById('vet_clinica')?.value.trim() || '';
    const vetEndereco = document.getElementById('vet_endereco')?.value.trim() || '';
    const vetTelefone = document.getElementById('vet_telefone')?.value.trim() || '';
    const vetEmail = document.getElementById('vet_email')?.value.trim() || '';

    if (!vetNome || !vetCrmv || !vetTelefone || !vetEmail) {
        alert("Por favor, preencha os campos obrigatórios do Médico Veterinário (Nome, CRMV, Telefone e E-mail) antes de prosseguir.");
        return;
    }

    const dadosVet = {
        nome: vetNome,
        crmv: vetCrmv,
        clinica: vetClinica,
        endereco: vetEndereco,
        telefone: vetTelefone,
        email: vetEmail
    };

    localStorage.setItem('vetNotificante', JSON.stringify(dadosVet));
    window.location.href = paginaDestino;
};
