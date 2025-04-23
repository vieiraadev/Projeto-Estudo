const addDisciplinaButton = document.getElementById('addDisciplinaButton');
const modalOverlay = document.getElementById('modalOverlay');
const closeModalButton = document.getElementById('closeModalButton');
const cancelButton = document.getElementById('cancelButton');
const disciplinaForm = document.getElementById('disciplinaForm');
const disciplinasList = document.getElementById('disciplinasList');

// Modal de descrição
const descricaoModal = document.getElementById("descricaoModal");
const modalDisciplinaNome = document.getElementById("modalDisciplinaNome");
const modalDisciplinaDescricao = document.getElementById("modalDisciplinaDescricao");
const editarButton = document.getElementById('editarButton');
const excluirButton = document.getElementById('excluirButton');

// Variáveis de controle de edição
let editandoDisciplina = false;
let disciplinaAtual = null;

function openModal() {
    modalOverlay.classList.add('active');
    disciplinaForm.reset(); // Reseta o formulário para evitar dados de edições anteriores
    editarButton.style.display = 'none'; // Esconde o botão de editar até que uma disciplina seja carregada para edição
    excluirButton.style.display = 'none'; // Esconde o botão de excluir até que uma disciplina seja carregada para exclusão
}

function closeModal() {
    modalOverlay.classList.remove('active');
    disciplinaForm.reset();
}

function abrirDescricaoModal(nome, descricao, id_disciplina) {
    console.log('Abrindo modal de descrição para a disciplina:', nome, descricao); // Depuração
    modalDisciplinaNome.textContent = nome;
    modalDisciplinaDescricao.textContent = descricao || "Sem descrição.";

    descricaoModal.style.display = "flex";
    descricaoModal.classList.add("active");

    // Habilita os botões de edição e exclusão no modal
    editarButton.style.display = 'inline-block';
    excluirButton.style.display = 'inline-block';

    // Define as funções dos botões
    editarButton.onclick = () => {
        editarDisciplina(id_disciplina, nome, descricao); // Chama a função para editar
        fecharDescricaoModal(); // Fecha o modal de descrição imediatamente após editar
    };
    excluirButton.onclick = () => excluirDisciplina(id_disciplina);
}


function fecharDescricaoModal() {
    descricaoModal.style.display = "none";
}

function addDisciplina(nome, descricao, id_disciplina) {
    const disciplinaItem = document.createElement('div');
    disciplinaItem.className = 'disciplina-item';
    disciplinaItem.innerHTML = `
        <span>${nome}</span>
    `;

    // Evento para abrir o modal de descrição
    disciplinaItem.addEventListener('click', (e) => {
        e.stopPropagation(); // Impede a propagação do clique
        abrirDescricaoModal(nome, descricao, id_disciplina); // Abre o modal de descrição
    });

    disciplinasList.appendChild(disciplinaItem);
}

function editarDisciplina(id_disciplina, nome, descricao) {
    openModal();  // Abre o modal de edição

    editandoDisciplina = true;  // Marca que estamos editando uma disciplina
    disciplinaAtual = { id: id_disciplina, nome, descricao }; // Armazena a disciplina para futuras edições

    // Preenche os campos do formulário com os dados da disciplina
    document.getElementById('nome_disciplina').value = nome;
    document.getElementById('descricao_disciplina').value = descricao;

    editarButton.style.display = 'inline-block'; // Exibe o botão de editar
    excluirButton.style.display = 'inline-block'; // Exibe o botão de excluir
}



function excluirDisciplina(id_disciplina) {
    if (confirm("Você tem certeza que deseja excluir esta disciplina?")) {
        fetch('/Projeto-Planner/Project/php/excluir_disciplina.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `id_disciplina=${encodeURIComponent(id_disciplina)}`
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'sucesso') {
                fecharDescricaoModal();
                carregarDisciplinas(); // Recarrega as disciplinas após exclusão
            } else {
                alert('Erro ao excluir a disciplina: ' + (data.erro || 'Erro desconhecido'));
            }
        })
        .catch(error => {
            console.error('Erro:', error);
            alert('Erro ao conectar com o servidor.');
        });
    }
}

function carregarDisciplinas() {
    fetch('/Projeto-Planner/Project/php/listar_disciplinas.php')
        .then(response => response.json())
        .then(data => {
            if (data.sucesso) {
                disciplinasList.innerHTML = ''; // Limpa lista antes de carregar novamente
                data.disciplinas.forEach(d => {
                    addDisciplina(d.nome_disciplina, d.descricao_disciplina, d.id_disciplina);
                });
            } else {
                alert('Erro ao carregar disciplinas: ' + (data.erro || 'Erro desconhecido'));
            }
        })
        .catch(error => {
            console.error('Erro:', error);
            alert('Erro ao conectar com o servidor.');
        });
}

disciplinaForm.addEventListener('submit', function(event) {
    event.preventDefault();

    const nome = document.getElementById('nome_disciplina').value.trim();
    const descricao = document.getElementById('descricao_disciplina').value.trim();

    if (nome !== '') {
        const url = editandoDisciplina
          ? '/Projeto-Planner/Project/php/editar_disciplina.php'
          : '/Projeto-Planner/Project/php/salvar_disciplina.php';

        const metodo = 'POST'; // << CORRIGIDO
        const id = editandoDisciplina
          ? `&id_disciplina=${encodeURIComponent(disciplinaAtual.id)}`
          : '';

        fetch(url, {
            method: metodo,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `nome_disciplina=${encodeURIComponent(nome)}&descricao_disciplina=${encodeURIComponent(descricao)}${id}`
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'sucesso') {
                if (editandoDisciplina) {
                    fecharDescricaoModal();
                    carregarDisciplinas();
                } else {
                    const nova = data.disciplina;
                    addDisciplina(nova.nome_disciplina, nova.descricao_disciplina, nova.id_disciplina);
                }
                closeModal();
                editandoDisciplina = false;
                disciplinaAtual = null;
            } else {
                alert('Erro ao salvar disciplina: ' + (data.erro || 'Erro desconhecido'));
            }
        })
        .catch(error => {
            console.error('Erro:', error);
            alert('Erro ao conectar com o servidor.');
        });
    }
});


// Eventos de Modal
addDisciplinaButton.addEventListener('click', openModal);
closeModalButton.addEventListener('click', closeModal);
cancelButton.addEventListener('click', closeModal);

modalOverlay.addEventListener('click', function(event) {
    if (event.target === modalOverlay) {
        closeModal();
    }
});

descricaoModal.addEventListener('click', function(event) {
    if (event.target === descricaoModal) {
        fecharDescricaoModal();
    }
});

// Iniciar carregamento
window.addEventListener('DOMContentLoaded', carregarDisciplinas);
