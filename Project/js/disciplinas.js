const addDisciplinaButton = document.getElementById('addDisciplinaButton');
const modalOverlay = document.getElementById('modalOverlay');
const closeModalButton = document.getElementById('closeModalButton');
const cancelButton = document.getElementById('cancelButton');
const disciplinaForm = document.getElementById('disciplinaForm');
const disciplinasList = document.getElementById('disciplinasList');
const descricaoModal = document.getElementById("descricaoModal");
const modalDisciplinaNome = document.getElementById("modalDisciplinaNome");
const modalDisciplinaDescricao = document.getElementById("modalDisciplinaDescricao");

let editandoDisciplina = false;
let disciplinaAtual = null;

function openModal(isEdicao = false) {
  modalOverlay.classList.add('active');

  if (!isEdicao) {
    disciplinaForm.reset();
    editandoDisciplina = false;
    disciplinaAtual = null;
  }
}

function closeModal() {
  modalOverlay.classList.remove('active');
  disciplinaForm.reset();
  editandoDisciplina = false;
  disciplinaAtual = null;
}

function abrirDescricaoModal(nome, descricao, id_disciplina) {
  modalDisciplinaNome.textContent = nome;
  modalDisciplinaDescricao.textContent = descricao || "Sem descrição.";

  descricaoModal.style.display = "flex";
  descricaoModal.classList.add("active");
}

function fecharDescricaoModal() {
  descricaoModal.style.display = "none";
}

function addDisciplina(nome, descricao, id_disciplina) {
  const disciplinaItem = document.createElement('div');
  disciplinaItem.className = 'disciplina-item';

  const disciplinaNome = document.createElement('span');
  disciplinaNome.textContent = nome;

  const botoes = document.createElement('div');
  botoes.className = 'disciplina-acoes';

  const editarBtn = document.createElement('button');
  editarBtn.className = 'editar-btn';
  editarBtn.textContent = 'Editar';
  editarBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    editarDisciplina(id_disciplina, nome, descricao);
  });

  const excluirBtn = document.createElement('button');
  excluirBtn.className = 'excluir-btn';
  excluirBtn.textContent = 'Excluir';
  excluirBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    excluirDisciplina(id_disciplina);
  });

  botoes.appendChild(editarBtn);
  botoes.appendChild(excluirBtn);

  disciplinaItem.appendChild(disciplinaNome);
  disciplinaItem.appendChild(botoes);

  disciplinaItem.addEventListener('click', () => {
    abrirDescricaoModal(nome, descricao, id_disciplina);
  });

  disciplinasList.appendChild(disciplinaItem);
}

function editarDisciplina(id_disciplina, nome, descricao) {
  fecharDescricaoModal();
  openModal(true);

  editandoDisciplina = true;
  disciplinaAtual = { id: id_disciplina, nome, descricao };

  document.getElementById('nome_disciplina').value = nome;
  document.getElementById('descricao_disciplina').value = descricao;
}

function excluirDisciplina(id_disciplina) {
  Swal.fire({
    title: "Tem certeza?",
    text: "Você deseja excluir esta disciplina?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Sim, excluir",
    cancelButtonText: "Cancelar",
    confirmButtonColor: "#d33",
    cancelButtonColor: "#aaa"
  }).then((result) => {
    if (!result.isConfirmed) return;

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
        carregarDisciplinas();
        Swal.fire("Excluído!", "Disciplina removida com sucesso.", "success");
      } else {
        Swal.fire("Erro", data.erro || "Erro ao excluir disciplina.", "error");
      }
    })
    .catch(error => {
      console.error('Erro:', error);
      Swal.fire("Erro", "Erro ao conectar com o servidor.", "error");
    });
  });
}

function carregarDisciplinas() {
  fetch('/Projeto-Planner/Project/php/listar_disciplinas.php')
    .then(response => response.json())
    .then(data => {
      if (data.sucesso) {
        disciplinasList.innerHTML = '';
        data.disciplinas.forEach(d => {
          addDisciplina(d.nome_disciplina, d.descricao_disciplina, d.id_disciplina);
        });
      } else {
        Swal.fire("Erro", data.erro || "Erro ao carregar disciplinas.", "error");
      }
    })
    .catch(error => {
      console.error('Erro:', error);
      Swal.fire("Erro", "Erro ao conectar com o servidor.", "error");
    });
}

disciplinaForm.addEventListener('submit', function (event) {
  event.preventDefault();

  const nome = document.getElementById('nome_disciplina').value.trim();
  const descricao = document.getElementById('descricao_disciplina').value.trim();

  if (nome !== '') {
    const url = editandoDisciplina
      ? '/Projeto-Planner/Project/php/editar_disciplina.php'
      : '/Projeto-Planner/Project/php/salvar_disciplina.php';

    const id = editandoDisciplina ? `&id_disciplina=${encodeURIComponent(disciplinaAtual?.id || '')}` : '';

    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `nome_disciplina=${encodeURIComponent(nome)}&descricao_disciplina=${encodeURIComponent(descricao)}${id}`
    })
      .then(response => response.json())
      .then(data => {
        if (data.status === 'sucesso') {
          carregarDisciplinas();
          Swal.fire(
            editandoDisciplina ? "Atualizado!" : "Criado!",
            editandoDisciplina ? "Disciplina editada com sucesso." : "Disciplina criada com sucesso.",
            "success"
          );
          closeModal();
        } else {
          Swal.fire("Erro", data.erro || "Erro ao salvar disciplina.", "error");
        }
      })
      .catch(error => {
        console.error('Erro:', error);
        Swal.fire("Erro", "Erro ao conectar com o servidor.", "error");
      });
  }
});

addDisciplinaButton.addEventListener('click', () => openModal());
closeModalButton.addEventListener('click', closeModal);
cancelButton.addEventListener('click', closeModal);

modalOverlay.addEventListener('click', function (event) {
  if (event.target === modalOverlay) {
    closeModal();
  }
});

descricaoModal.addEventListener('click', function (event) {
  if (event.target === descricaoModal) {
    fecharDescricaoModal();
  }
});

window.addEventListener('DOMContentLoaded', carregarDisciplinas);
