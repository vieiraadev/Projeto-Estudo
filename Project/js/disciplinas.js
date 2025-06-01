const addDisciplinaButton = document.getElementById('addDisciplinaButton');
const modalOverlay = document.getElementById('modalOverlay');
const closeModalButton = document.getElementById('closeModalButton');
const cancelButton = document.getElementById('cancelButton');
const disciplinaForm = document.getElementById('disciplinaForm');
const disciplinasList = document.getElementById('disciplinasList');
const descricaoModal = document.getElementById("descricaoModal");
const modalDisciplinaNome = document.getElementById("modalDisciplinaNome");
const modalDisciplinaDescricao = document.getElementById("modalDisciplinaDescricao");
const editarButton = document.getElementById('editarButton');
const excluirButton = document.getElementById('excluirButton');

let editandoDisciplina = false;
let disciplinaAtual = null;

function openModal() {
  modalOverlay.classList.add('active');
  disciplinaForm.reset();
  editarButton.style.display = 'none';
  excluirButton.style.display = 'none';
}

function closeModal() {
  modalOverlay.classList.remove('active');
  disciplinaForm.reset();
}

function abrirDescricaoModal(nome, descricao, id_disciplina) {
  modalDisciplinaNome.textContent = nome;
  modalDisciplinaDescricao.textContent = descricao || "Sem descrição.";

  descricaoModal.style.display = "flex";
  descricaoModal.classList.add("active");

  editarButton.style.display = 'inline-block';
  excluirButton.style.display = 'inline-block';

  editarButton.onclick = () => {
    editarDisciplina(id_disciplina, nome, descricao);
    fecharDescricaoModal();
  };
  excluirButton.onclick = () => excluirDisciplina(id_disciplina);
}

function fecharDescricaoModal() {
  descricaoModal.style.display = "none";
}

function addDisciplina(nome, descricao, id_disciplina) {
  const disciplinaItem = document.createElement('div');
  disciplinaItem.className = 'disciplina-item';
  disciplinaItem.innerHTML = `<span>${nome}</span>`;

  disciplinaItem.addEventListener('click', (e) => {
    e.stopPropagation();
    abrirDescricaoModal(nome, descricao, id_disciplina);
  });

  disciplinasList.appendChild(disciplinaItem);
}

function editarDisciplina(id_disciplina, nome, descricao) {
  openModal();
  editandoDisciplina = true;
  disciplinaAtual = { id: id_disciplina, nome, descricao };

  document.getElementById('nome_disciplina').value = nome;
  document.getElementById('descricao_disciplina').value = descricao;

  editarButton.style.display = 'inline-block';
  excluirButton.style.display = 'inline-block';
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
        Swal.fire({
          icon: "error",
          title: "Erro ao excluir disciplina",
          text: data.erro || "Erro desconhecido. Tente novamente.",
        });
      }
    })
    .catch(error => {
      console.error('Erro:', error);
      Swal.fire({
        icon: "error",
        title: "Erro de conexão",
        text: "Não foi possível conectar com o servidor. Verifique sua internet ou tente novamente.",
      });
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
      Swal.fire({
        icon: "error",
        title: "Erro de conexão",
        text: "Erro ao conectar com o servidor.",
      });
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

    const metodo = 'POST';
    const id = editandoDisciplina ? `&id_disciplina=${encodeURIComponent(disciplinaAtual?.id || '')}` : '';

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
            Swal.fire("Atualizado!", "Disciplina editada com sucesso.", "success");
          } else {
            const nova = data.disciplina;
            addDisciplina(nova.nome_disciplina, nova.descricao_disciplina, nova.id_disciplina);
            Swal.fire("Criado!", "Disciplina criada com sucesso.", "success");
          }
          closeModal();
          editandoDisciplina = false;
          disciplinaAtual = null;
        } else {
          Swal.fire("Erro", data.erro || "Erro ao salvar disciplina.", "error");
        }
      })
      .catch(error => {
        console.error('Erro:', error);
        Swal.fire({
          icon: "error",
          title: "Erro de conexão",
          text: "Erro ao conectar com o servidor.",
        });
      });
  }
});

addDisciplinaButton.addEventListener('click', openModal);
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
