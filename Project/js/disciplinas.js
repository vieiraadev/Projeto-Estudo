const addDisciplinaButton = document.getElementById('addDisciplinaButton');
const modalOverlay = document.getElementById('modalOverlay');
const closeModalButton = document.getElementById('closeModalButton');
const cancelButton = document.getElementById('cancelButton');
const disciplinaForm = document.getElementById('disciplinaForm');
const disciplinasList = document.getElementById('disciplinasList');

function openModal() {
    modalOverlay.classList.add('active');
}

function closeModal() {
    modalOverlay.classList.remove('active');
    disciplinaForm.reset();
}

function addDisciplina(nome) {
    const disciplinaItem = document.createElement('div');
    disciplinaItem.className = 'disciplina-item';
    disciplinaItem.innerHTML = `
        <span>${nome}</span>
        <i class='bx bx-chevron-down expand-icon'></i>
    `;
    disciplinasList.appendChild(disciplinaItem);
}

addDisciplinaButton.addEventListener('click', openModal);
closeModalButton.addEventListener('click', closeModal);
cancelButton.addEventListener('click', closeModal);

modalOverlay.addEventListener('click', function(event) {
    if (event.target === modalOverlay) {
        closeModal();
    }
});

disciplinaForm.addEventListener('submit', function(event) {
    event.preventDefault();
    const nome = document.getElementById('nomeDisciplina').value;
    if (nome.trim() !== '') {
        addDisciplina(nome);
        closeModal();
    }
});
