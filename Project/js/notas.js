let ras = [
    { id: 1, nome: 'RA1 - Avaliação Conceitual', porcentagem: 20, notas: [] },
    { id: 2, nome: 'RA2 - Avaliação Prática', porcentagem: 30, notas: [] },
    { id: 3, nome: 'RA3 - Projeto Final', porcentagem: 50, notas: [] }
];

let proximoIdRa = 4;
let raAtual = null;
let provasTemp = [];
let trabalhosTemp = [];

// Elementos do DOM
const listaRas = document.getElementById('lista-ras');
const mediaFinalElement = document.getElementById('media-final');
const statusAlunoElement = document.getElementById('status-aluno');
const modalOverlay = document.getElementById('modal-overlay');
const modalTitulo = document.getElementById('modal-titulo');

// Botões e campos do formulário
const btnAdicionarRa = document.getElementById('btn-adicionar-ra');
const novoRaNome = document.getElementById('novo-ra-nome');
const novoRaPeso = document.getElementById('novo-ra-peso');

const btnAdicionarProva = document.getElementById('btn-adicionar-prova');
const novaProvaNome = document.getElementById('nova-prova-nome');
const novaProvaValor = document.getElementById('nova-prova-valor');
const provasAdicionadas = document.getElementById('provas-adicionadas');
const listaProvas = document.getElementById('lista-provas');

const btnAdicionarTrabalho = document.getElementById('btn-adicionar-trabalho');
const novoTrabalhoNome = document.getElementById('novo-trabalho-nome');
const novoTrabalhoValor = document.getElementById('novo-trabalho-valor');
const trabalhosAdicionados = document.getElementById('trabalhos-adicionados');
const listaTrabalhos = document.getElementById('lista-trabalhos');

const btnCancelar = document.getElementById('btn-cancelar');
const btnSalvar = document.getElementById('btn-salvar');

const novaProvaPeso = document.getElementById('nova-prova-peso');
const novoTrabalhoPeso = document.getElementById('novo-trabalho-peso');

// Funções
function calcularMediaRa(ra) {
    if (!ra.notas || ra.notas.length === 0) return 0;
    
    let somaPesos = 0;
    let somaNotasPonderadas = 0;
    
    ra.notas.forEach(nota => {
        somaNotasPonderadas += nota.valor * nota.peso;
        somaPesos += nota.peso;
    });
    
    return somaPesos > 0 ? somaNotasPonderadas / somaPesos : 0;
}

function calcularMediaFinal() {
    let somaPorcentagens = 0;
    let somaNotas = 0;
    
    ras.forEach(ra => {
        const mediaRa = calcularMediaRa(ra);
        somaNotas += mediaRa * (ra.porcentagem / 100);
        somaPorcentagens += ra.porcentagem / 100;
    });
    
    return somaPorcentagens > 0 ? somaNotas / somaPorcentagens : 0;
}

function atualizarInterface() {
    // Atualizar lista de RAs
    listaRas.innerHTML = '';
    
    ras.forEach(ra => {
        const mediaRa = calcularMediaRa(ra);
        
        const raElement = document.createElement('div');
        raElement.className = 'ra-item';
        
        let raHTML = `
            <div class="ra-header">
                <div class="ra-info">
                    <h3>${ra.nome}</h3>
                    <p>Porcentagem: ${ra.porcentagem}%</p>
                </div>
                <div class="ra-acoes">
                    <button class="btn btn-azul btn-lancar-notas" data-id="${ra.id}">Lançar Notas</button>
                    <button class="btn btn-vermelho btn-remover-ra" data-id="${ra.id}">Remover</button>
                </div>
            </div>
        `;
        
        if (ra.notas.length > 0) {
            raHTML += `
                <div class="notas-container">
                    <h4>Notas:</h4>
                    <div class="notas-grid">
            `;
            
            ra.notas.forEach((nota, index) => {
                raHTML += `
                    <div class="nota-item">
                        <span>${nota.nome}: ${nota.valor.toFixed(2)} (Peso: ${nota.peso})</span>
                        <button class="remover-nota" data-ra-id="${ra.id}" data-nota-index="${index}">×</button>
                    </div>
                `;
            });
            
            raHTML += `
                    </div>
                    <p class="ra-media">Média do RA: ${mediaRa.toFixed(2)}</p>
                </div>
            `;
        }
        
        raElement.innerHTML = raHTML;
        listaRas.appendChild(raElement);
    });
    
    // Atualizar média final e status
    const mediaFinal = calcularMediaFinal();
    mediaFinalElement.textContent = mediaFinal.toFixed(2);
    
    if (mediaFinal >= 7) {
        statusAlunoElement.textContent = 'Aprovado';
        statusAlunoElement.className = 'status status-aprovado';
    } else if (mediaFinal >= 5) {
        statusAlunoElement.textContent = 'Recuperação';
        statusAlunoElement.className = 'status status-recuperacao';
    } else {
        statusAlunoElement.textContent = 'Reprovado';
        statusAlunoElement.className = 'status status-reprovado';
    }
    
    // Adicionar event listeners para botões
    document.querySelectorAll('.btn-lancar-notas').forEach(btn => {
        btn.addEventListener('click', function() {
            const raId = parseInt(this.getAttribute('data-id'));
            abrirModal(raId);
        });
    });
    
    document.querySelectorAll('.btn-remover-ra').forEach(btn => {
        btn.addEventListener('click', function() {
            const raId = parseInt(this.getAttribute('data-id'));
            removerRa(raId);
        });
    });
    
    document.querySelectorAll('.remover-nota').forEach(btn => {
        btn.addEventListener('click', function() {
            const raId = parseInt(this.getAttribute('data-ra-id'));
            const notaIndex = parseInt(this.getAttribute('data-nota-index'));
            removerNota(raId, notaIndex);
        });
    });
}

function abrirModal(raId) {
    raAtual = ras.find(ra => ra.id === raId);
    if (!raAtual) return;
    
    modalTitulo.textContent = `Lançar Notas para ${raAtual.nome}`;
    modalOverlay.style.display = 'flex';
    
    // Limpar dados temporários
    provasTemp = [];
    trabalhosTemp = [];
    atualizarListasModal();
    
    // Limpar campos
    novaProvaNome.value = '';
    novaProvaValor.value = '';
    novoTrabalhoNome.value = '';
    novoTrabalhoValor.value = '';
}

function fecharModal() {
    modalOverlay.style.display = 'none';
    raAtual = null;
}

function atualizarListasModal() {
    // Atualizar lista de provas
    if (provasTemp.length > 0) {
        listaProvas.innerHTML = '';
        provasTemp.forEach(prova => {
            const li = document.createElement('li');
            li.textContent = `${prova.nome}: ${prova.valor.toFixed(2)} (Peso: ${prova.peso})`;
            listaProvas.appendChild(li);
        });
        provasAdicionadas.style.display = 'block';
    } else {
        provasAdicionadas.style.display = 'none';
    }
    
    // Atualizar lista de trabalhos
    if (trabalhosTemp.length > 0) {
        listaTrabalhos.innerHTML = '';
        trabalhosTemp.forEach(trabalho => {
            const li = document.createElement('li');
            li.textContent = `${trabalho.nome}: ${trabalho.valor.toFixed(2)} (Peso: ${trabalho.peso})`;
            listaTrabalhos.appendChild(li);
        });
        trabalhosAdicionados.style.display = 'block';
    } else {
        trabalhosAdicionados.style.display = 'none';
    }
}

function adicionarProva() {
    const nome = novaProvaNome.value.trim();
    const valorStr = novaProvaValor.value;
    const pesoStr = novaProvaPeso.value;
    
    if (nome && valorStr && pesoStr) {
        const valor = parseFloat(valorStr);
        const peso = parseInt(pesoStr);
        if (peso <= 0) return;
        
        provasTemp.push({ nome, valor, peso });
        
        // Limpar campos
        novaProvaNome.value = '';
        novaProvaValor.value = '';
        novaProvaPeso.value = '1';
        
        atualizarListasModal();
    }
}

function adicionarTrabalho() {
    const nome = novoTrabalhoNome.value.trim();
    const valorStr = novoTrabalhoValor.value;
    const pesoStr = novoTrabalhoPeso.value;
    
    if (nome && valorStr && pesoStr) {
        const valor = parseFloat(valorStr);
        const peso = parseInt(pesoStr);
        if (peso <= 0) return;
        
        trabalhosTemp.push({ nome, valor, peso });
        
        // Limpar campos
        novoTrabalhoNome.value = '';
        novoTrabalhoValor.value = '';
        novoTrabalhoPeso.value = '1';
        
        atualizarListasModal();
    }
}

function salvarNotas() {
    if (!raAtual) return;
    
    const novasNotas = [...provasTemp, ...trabalhosTemp];
    if (novasNotas.length === 0) {
        fecharModal();
        return;
    }
    
    // Encontrar o RA e adicionar as novas notas
    for (let i = 0; i < ras.length; i++) {
        if (ras[i].id === raAtual.id) {
            ras[i].notas = [...ras[i].notas, ...novasNotas];
            break;
        }
    }
    
    fecharModal();
    atualizarInterface();
}

function adicionarRa() {
    const nome = novoRaNome.value.trim();
    const porcentagemStr = novoRaPeso.value;
    
    if (nome && porcentagemStr) {
        const porcentagem = parseInt(porcentagemStr);
        if (porcentagem <= 0 || porcentagem > 100) return;
        
        const novoRa = {
            id: proximoIdRa,
            nome: nome,
            porcentagem: porcentagem,
            notas: []
        };
        
        ras.push(novoRa);
        proximoIdRa++;
        
        // Limpar campos
        novoRaNome.value = '';
        novoRaPeso.value = '10';
        
        atualizarInterface();
    }
}

function removerRa(raId) {
    ras = ras.filter(ra => ra.id !== raId);
    atualizarInterface();
}

function removerNota(raId, notaIndex) {
    for (let i = 0; i < ras.length; i++) {
        if (ras[i].id === raId) {
            ras[i].notas.splice(notaIndex, 1);
            break;
        }
    }
    atualizarInterface();
}

// Event Listeners
btnAdicionarRa.addEventListener('click', adicionarRa);
btnAdicionarProva.addEventListener('click', adicionarProva);
btnAdicionarTrabalho.addEventListener('click', adicionarTrabalho);
btnCancelar.addEventListener('click', fecharModal);
btnSalvar.addEventListener('click', salvarNotas);

// Verificar se as porcentagens somam 100%
// Inicializar interface
atualizarInterface();
verificarPorcentagens();