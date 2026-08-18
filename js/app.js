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
    
    aplicarMascaras(); 

    // LÓGICA PARA MOSTRAR/OCULTAR O CAMPO "OUTRO" NO MUNICÍPIO
    document.querySelectorAll('input[name="tutor_municipio_opcao"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            const inputOutro = document.getElementById('tutor_municipio_outro');
            if (inputOutro) {
                if (e.target.value === 'Outro') {
                    inputOutro.style.display = 'block';
                    inputOutro.setAttribute('required', 'true');
                } else {
                    inputOutro.style.display = 'none';
                    inputOutro.removeAttribute('required');
                    inputOutro.value = '';
                }
            }
        });
    });
    
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
            
            const urlParams = new URLSearchParams(window.location.search);
            const shouldAutofill = urlParams.get('autofill') === 'true';

            if (shouldAutofill) {
                preencherCamposVet(vet);
            }

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

    // ==========================================================================
    // 3. INTEGRAÇÃO: ENVIO PARA O SUPABASE AO SUBMETER O FORMULÁRIO
    // ==========================================================================
    const formEsporotricose = document.getElementById('form-esporotricose');

    if (formEsporotricose) {
        formEsporotricose.addEventListener('submit', async (e) => {
            e.preventDefault();

            const btnSubmit = formEsporotricose.querySelector('button[type="submit"]');
            const textoOriginalBtn = btnSubmit ? btnSubmit.innerText : 'Enviar';

            try {
                if (btnSubmit) {
                    btnSubmit.disabled = true;
                    btnSubmit.innerText = 'Enviando notificação...';
                }

                // Função auxiliar inteligente para buscar valores (seja input text, select ou radio)
                const getVal = (name) => {
                    const el = document.getElementById(name);
                    if (el && (el.tagName === 'SELECT' || el.tagName === 'TEXTAREA' || (el.tagName === 'INPUT' && el.type !== 'radio' && el.type !== 'checkbox'))) {
                        return el.value;
                    }
                    const radio = document.querySelector(`input[name="${name}"]:checked`);
                    return radio ? radio.value : '';
                };

                // Coleta dados de múltipla escolha (arrays)
                const locaisLesoesChecked = Array.from(document.querySelectorAll('input[name="locais_lesoes"]:checked')).map(cb => cb.value);
                const sinaisClinicosChecked = Array.from(document.querySelectorAll('input[name="sinais_clinicos"]:checked')).map(cb => cb.value);

                // Tratamento correto do Município (Verifica se é Sorocaba ou Outro)
                const opcaoMunicipio = getVal('tutor_municipio_opcao');
                const municipioFinal = opcaoMunicipio === 'Outro' ? getVal('tutor_municipio_outro') : 'Sorocaba';

                // Recupera os dados do veterinário salvos
                const vetDados = JSON.parse(localStorage.getItem('vetNotificante')) || {};

                // Estrutura o novo payload JSON (sem os prefixos p_)
                const payload = {
                    vet_nome: vetDados.nome || getVal('vet_nome'),
                    vet_crmv: vetDados.crmv || getVal('vet_crmv'),
                    vet_clinica: vetDados.clinica || getVal('vet_clinica'),
                    vet_endereco: vetDados.endereco || getVal('vet_endereco'),
                    vet_telefone: vetDados.telefone || getVal('vet_telefone'),
                    vet_email: vetDados.email || getVal('vet_email'),

                    tutor_nome: getVal('tutor_nome'),
                    tutor_cpf: getVal('tutor_cpf'),
                    tutor_telefone: getVal('tutor_telefone'),
                    tutor_endereco: getVal('tutor_endereco'),
                    tutor_numero: getVal('tutor_numero'),
                    tutor_complemento: getVal('tutor_complemento'),
                    tutor_bairro: getVal('tutor_bairro'),
                    tutor_municipio: municipioFinal, // Variável corrigida aqui

                    animal_nome: getVal('animal_nome'),
                    animal_especie: getVal('animal_especie'),
                    animal_raca: getVal('animal_raca'),
                    animal_sexo: getVal('animal_sexo'),
                    animal_idade: getVal('animal_idade'),
                    animal_peso: getVal('animal_peso'),
                    animal_tamanho_pelo: getVal('animal_tamanho_pelo'),
                    animal_cor_pelagem: getVal('animal_cor_pelagem'),
                    animal_castrado: getVal('animal_castrado'),
                    animal_comportamento: getVal('animal_comportamento'),
                    animal_condicao_fisica: getVal('animal_condicao_fisica'),

                    ambiente_moradia: getVal('ambiente_moradia'),
                    classificacao_habitacao: getVal('classificacao_habitacao'),
                    data_inicio_sinais: getVal('data_inicio_sinais') || null, 
                    lesao_pele: getVal('lesao_pele'),
                    
                    distribuicao_lesoes: getVal('distribuicao_lesoes'),
                    humanos_com_lesoes: getVal('humanos_com_lesoes'),
                    outros_animais_com_lesoes: getVal('outros_animais_com_lesoes'),
                    coleta_amostra: getVal('coleta_amostra'),
                    tratamento_iniciado: getVal('tratamento_iniciado'),
                    tratamento_detalhes: getVal('tratamento_detalhes'),
                    observacoes: getVal('observacoes'),

                    sinais_clinicos: sinaisClinicosChecked,
                    locais_lesoes: locaisLesoesChecked 
                };

                // Chamada RPC do Supabase usando a função definitiva JSON e o client global
                const { data, error } = await window.supabaseClient.rpc('salvar_notificacao_esporotricose_acid', { payload: payload });

                if (error) {
                    throw new Error(error.message);
                }

                // A nova função SQL retorna 'sucesso' como boolean (true/false)
                if (data && data.sucesso === true) {
                    alert(`Sucesso! Notificação registrada sob o número: ${data.numero_notificacao}`);
                    formEsporotricose.reset();
                    // Opcional: window.location.href = 'index.html';
                } else {
                    alert(`Atenção: ${data?.erro || 'Erro desconhecido ao salvar.'}`);
                }

            } catch (err) {
                console.error('Erro na gravação:', err);
                alert(`Falha ao registrar notificação: ${err.message}`);
            } finally {
                if (btnSubmit) {
                    btnSubmit.disabled = false;
                    btnSubmit.innerText = textoOriginalBtn;
                }
            }
        });
    }
});

// ==========================================================================
// FUNÇÕES AUXILIARES E GLOBAIS
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
