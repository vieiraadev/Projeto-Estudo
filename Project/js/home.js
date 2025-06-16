document.addEventListener("DOMContentLoaded", function () {
  fetch("/Projeto-Planner/Project/php/exibir_anuncios.php")
  .then(response => response.text())
  .then(data => {
    console.log(data); // VER AQUI O HTML
    document.getElementById("carousel").innerHTML = data;
  })

    .catch(error => {
      console.error("Erro ao carregar anúncios:", error);
    });
});
fetch('/Projeto-Planner/Project/php/home.php')
        .then(response => response.json())
        .then(data => {
          if (data.nome) {
            document.getElementById('mensagem').textContent = `Olá, ${data.nome} 👋`;
          } else {
            document.getElementById('mensagem').textContent = 'Olá, visitante!';
          }
        })
        .catch(error => {
          console.error('Erro ao buscar nome:', error);
          document.getElementById('mensagem').textContent = 'Erro ao carregar nome.';
        });

// Inicializar gráfico de desempenho
fetch('/Projeto-Planner/Project/php/listar_disciplinas.php')
    .then(response => response.json())
    .then(response => {
    if (!response.sucesso) throw new Error("Falha ao carregar disciplinas");
    const disciplinas = response.disciplinas;

    const labels = disciplinas.map(d => d.nome_disciplina);
    const notas = disciplinas.map(d => parseFloat(d.nota));

    const ctx = document.getElementById('performanceChart').getContext('2d');
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: notas,
                backgroundColor: [
                    '#3a7ca5',
                    '#2e86de',
                    '#54a0ff',
                    '#5f27cd',
                    '#00d2d3',
                    '#ff9ff3',
                    '#feca57',
                    '#48dbfb',
                    '#1dd1a1',
                    '#ff6b6b'
                ],
                borderWidth: 0,
                borderRadius: 4,
                spacing: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 15,
                        font: { size: 12 }
                    }
                }
            },
            cutout: '60%'
        }
    });

    // Atualizar a lista de disciplinas com nota (se tiver essa parte também)
    const subjectList = document.querySelector(".subject-list");
    if (subjectList) {
        subjectList.innerHTML = "";
        disciplinas.forEach(d => {
            const div = document.createElement("div");
            div.className = "subject-item";
            div.innerHTML = `
                <span class="subject-name">${d.nome_disciplina}</span>
                <span class="subject-grade">${parseFloat(d.nota).toFixed(1)}</span>
            `;
            subjectList.appendChild(div);
        });
    }

})
.catch(error => {
    console.error('Erro ao carregar disciplinas:', error);
});


document.addEventListener("DOMContentLoaded", () => {
  fetch('/Projeto-Planner/Project/php/tarefas_recentes.php')
      .then(response => response.json())
      .then(tarefas => {
          const lista = document.getElementById('listaTarefas');
          lista.innerHTML = '';

          if (tarefas.length === 0) {
              lista.innerHTML = "<p style='padding: 1rem;'>Nenhuma tarefa encontrada.</p>";
              return;
          }

          tarefas.forEach(tarefa => {
              const item = document.createElement('div');
              item.className = 'task-item';

              item.innerHTML = `
                  <div class="task-info">
                      <div class="task-title">${tarefa.titulo}</div>
                      <div class="task-date">${tarefa.data}</div>
                  </div>
                  <span class="task-priority priority-${tarefa.prioridade}">${tarefa.prioridade.charAt(0).toUpperCase() + tarefa.prioridade.slice(1)}</span>
              `;
              lista.appendChild(item);
          });
      })
      .catch(() => {
          document.getElementById('listaTarefas').innerHTML = "<p style='padding: 1rem;'>Erro ao carregar tarefas.</p>";
      });
});

document.addEventListener("DOMContentLoaded", function () {
  fetch('/Projeto-Planner/Project/php/respostas_recentes.php')
      .then(response => response.json())
      .then(data => {
          const container = document.getElementById('mensagens-suporte');
          container.innerHTML = '';

          const truncate = (text, limit = 60) => {
              return text.length > limit ? text.substring(0, limit) + '...' : text;
          };

          data.forEach(item => {
              const messageDiv = document.createElement('div');
              messageDiv.classList.add('message-item');

              messageDiv.innerHTML = `
                  <div class="message-info">
                      <div class="message-title">${truncate(item.resposta)}</div>
                      <div class="message-date">${new Date(item.data_envio).toLocaleString()}</div>
                  </div>
                  <span class="message-status status-read">Respondido</span>
              `;

              container.appendChild(messageDiv);
          });

          if (data.length === 0) {
              container.innerHTML = '<p>Nenhuma resposta disponível.</p>';
          }
      })
      .catch(error => {
          console.error('Erro ao carregar mensagens:', error);
      });
});

// JavaScript do Quadro Trello
let draggedCard = null;
let currentEditingCard = null;
let cardIdCounter = 1;

function initBoard() {
    // Carregar tarefas do banco de dados
    fetch('/Projeto-Planner/Project/php/carregar_tarefas_quadro.php')
        .then(response => response.json())
        .then(tarefas => {
            tarefas.forEach(tarefa => renderCard(tarefa));
        })
        .catch(error => {
            console.error("Erro ao carregar tarefas do banco:", error);
        });

    // Configurar drop zones (para permitir arrastar e soltar)
    setupDropZones();

    // Atualizar valor do progresso em tempo real
    const progressInput = document.getElementById('editProgress');
    if (progressInput) {
        progressInput.addEventListener('input', function(e) {
            document.getElementById('progressValue').textContent = e.target.value + '%';
        });
    }

    // Fechar modal clicando fora dele
    const cardEditor = document.getElementById('cardEditor');
    if (cardEditor) {
        cardEditor.addEventListener('click', function(e) {
            if (e.target === this) {
                closeCardEditor();
            }
        });
    }
}


function renderCard(cardData) {
    const container = document.getElementById(`cards-${cardData.column}`);
    const cardElement = document.createElement('div');
    cardElement.className = 'card';
    cardElement.draggable = true;
    cardElement.dataset.cardId = cardData.id;
    cardElement.dataset.column = cardData.column;

    // Guardar os dados extras no dataset
    cardElement.dataset.descricao = cardData.descricao || '';
    cardElement.dataset.diaSemana = cardData.dia_da_semana || '';
    cardElement.dataset.prioridade = cardData.priority || 'medium';
    cardElement.dataset.titulo = cardData.title || '';
    cardElement.dataset.disciplina = cardData.disciplina || '';

    const priorityClass = `priority-${cardData.priority}`;
    const formattedDate = formatDate(cardData.date);
    const progressText = cardData.progress > 0 ? `${cardData.progress}%` : '';

    cardElement.innerHTML = `
        <div class="priority-indicator ${priorityClass}"></div>
        <div class="card-title">${cardData.title}</div>
        <div class="card-meta">
            <div class="card-date">
                <span>📅</span>
                <span>${formattedDate}</span>
            </div>
            ${progressText ? `<div class="card-progress">✓ ${progressText}</div>` : ''}
        </div>
    `;

    cardElement.addEventListener('click', () => abrirModal(cardElement));
    cardElement.addEventListener('dragstart', handleDragStart);
    cardElement.addEventListener('dragend', handleDragEnd);

    container.appendChild(cardElement);
}


// Formatear data
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric' 
    });
}

// Mostrar formulário de adicionar card
function showAddCardForm(column) {
    const form = document.getElementById(`form-${column}`);
    const btn = form.previousElementSibling;
    form.style.display = 'block';
    btn.style.display = 'none';
    form.querySelector('textarea').focus();
}

// Esconder formulário de adicionar card
function hideAddCardForm(column) {
    const form = document.getElementById(`form-${column}`);
    const btn = form.previousElementSibling;
    form.style.display = 'none';
    btn.style.display = 'flex';
    form.querySelector('textarea').value = '';
}

// Adicionar novo card
function addCard(column) {
    const form = document.getElementById(`form-${column}`);
    const textarea = form.querySelector('textarea');
    const title = textarea.value.trim();

    if (!title) return;

    const newCard = {
        id: `card-${cardIdCounter++}`,
        title: title,
        column: column,
        priority: 'medium',
        date: new Date().toISOString().split('T')[0],
        progress: 0
    };

    renderCard(newCard);
    hideAddCardForm(column);
}

// Drag and Drop
function handleDragStart(e) {
    draggedCard = e.target;
    e.target.classList.add('dragging');
}

function handleDragEnd(e) {
    e.target.classList.remove('dragging');
    draggedCard = null;
    
    // Esconder todas as drop zones
    document.querySelectorAll('.drop-zone').forEach(zone => {
        zone.classList.remove('active');
    });
}

// Configurar drop zones
function setupDropZones() {
    document.querySelectorAll('.cards-container').forEach(container => {
        container.addEventListener('dragover', handleDragOver);
        container.addEventListener('drop', handleDrop);
        container.addEventListener('dragenter', handleDragEnter);
        container.addEventListener('dragleave', handleDragLeave);
    });
}

function handleDragOver(e) {
    e.preventDefault();
}

function handleDragEnter(e) {
    e.preventDefault();
    const column = e.target.closest('.column');
    const dropZone = column.querySelector('.drop-zone');
    dropZone.classList.add('active');
}

function handleDragLeave(e) {
    if (!e.target.closest('.column').contains(e.relatedTarget)) {
        const column = e.target.closest('.column');
        const dropZone = column.querySelector('.drop-zone');
        dropZone.classList.remove('active');
    }
}

function handleDrop(e) {
    e.preventDefault();
    const column = e.target.closest('.column');
    const newColumn = column.dataset.column;
    const dropZone = column.querySelector('.drop-zone');

    if (draggedCard && draggedCard.dataset.column !== newColumn) {
        const container = column.querySelector('.cards-container');
        container.appendChild(draggedCard);
        draggedCard.dataset.column = newColumn;

        // Enviar atualização para o servidor
        const cardId = draggedCard.dataset.cardId;
        fetch('/Projeto-Planner/Project/php/atualizar_status_tarefa.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: cardId, column: newColumn })
        }).then(res => res.json())
          .then(response => {
              if (!response.success) {
                  console.error('Erro ao atualizar status da tarefa no banco.');
              }
          });
    }

    dropZone.classList.remove('active');
}


// Editor de cards
function openCardEditor(cardId) {
    const cardElement = document.querySelector(`[data-card-id="${cardId}"]`);
    if (!cardElement) return;

    currentEditingCard = cardId;
    const cardData = getCardData(cardElement);

    document.getElementById('editTitle').value = cardData.title;
    document.getElementById('editDate').value = cardData.date || '';
    document.getElementById('editPriority').value = cardData.priority || 'medium';
    document.getElementById('editProgress').value = cardData.progress || 0;
    document.getElementById('progressValue').textContent = (cardData.progress || 0) + '%';

    document.getElementById('cardEditor').style.display = 'flex';
}

function getCardData(cardElement) {
    const titleElement = cardElement.querySelector('.card-title');
    const dateElement = cardElement.querySelector('.card-date span:last-child');
    const progressElement = cardElement.querySelector('.card-progress');
    const priorityElement = cardElement.querySelector('.priority-indicator');

    let priority = 'medium';
    if (priorityElement.classList.contains('priority-high')) priority = 'high';
    else if (priorityElement.classList.contains('priority-low')) priority = 'low';

    let progress = 0;
    if (progressElement) {
        const progressText = progressElement.textContent.match(/\d+/);
        progress = progressText ? parseInt(progressText[0]) : 0;
    }

    // Converter data de volta para formato ISO
    let date = '';
    if (dateElement) {
        const dateText = dateElement.textContent;
        // Conversão simplificada - em produção seria mais robusta
        date = new Date().toISOString().split('T')[0];
    }

    return {
        title: titleElement.textContent,
        date: date,
        priority: priority,
        progress: progress
    };
}

function closeCardEditor() {
    document.getElementById('cardEditor').style.display = 'none';
    currentEditingCard = null;
}

function saveCard() {
    if (!currentEditingCard) return;

    const cardElement = document.querySelector(`[data-card-id="${currentEditingCard}"]`);
    const title = document.getElementById('editTitle').value.trim();
    const date = document.getElementById('editDate').value;
    const priority = document.getElementById('editPriority').value;
    const progress = parseInt(document.getElementById('editProgress').value);

    if (!title) return;

    // Atualizar o card
    const priorityClass = `priority-${priority}`;
    const formattedDate = date ? formatDate(date) : '';
    const progressText = progress > 0 ? `${progress}%` : '';

    cardElement.innerHTML = `
        <div class="priority-indicator ${priorityClass}"></div>
        <div class="card-title">${title}</div>
        <div class="card-meta">
            <div class="card-date">
                <span>📅</span>
                <span>${formattedDate}</span>
            </div>
            ${progressText ? `<div class="card-progress">✓ ${progressText}</div>` : ''}
        </div>
    `;

    closeCardEditor();
}

function deleteCard() {
    if (!currentEditingCard) return;

    const cardElement = document.querySelector(`[data-card-id="${currentEditingCard}"]`);
    if (cardElement && confirm('Tem certeza que deseja excluir esta tarefa?')) {
        cardElement.remove();
    }

    closeCardEditor();
}

// Event Listeners para inicialização
document.addEventListener('DOMContentLoaded', function() {
    // Verificar se os elementos existem antes de inicializar
    if (document.getElementById('board')) {
        initBoard();
        setupDropZones();
        
        // Atualizar valor do progresso em tempo real
        const progressInput = document.getElementById('editProgress');
        if (progressInput) {
            progressInput.addEventListener('input', function(e) {
                document.getElementById('progressValue').textContent = e.target.value + '%';
            });
        }

        // Fechar modal clicando fora
        const cardEditor = document.getElementById('cardEditor');
        if (cardEditor) {
            cardEditor.addEventListener('click', function(e) {
                if (e.target === this) {
                    closeCardEditor();
                }
            });
        }
    }
});

// Se você quiser inicializar manualmente, use: initTrelloBoard()
function initTrelloBoard() {
    initBoard();
    setupDropZones();
}

function abrirModal(card) {
    document.getElementById('modalTitulo').textContent = card.dataset.titulo || 'Sem título';
    document.getElementById('modalDescricao').textContent = card.dataset.descricao || 'Sem descrição';
    document.getElementById('modalDiaSemana').textContent = card.dataset.diaSemana || 'Não informado';
    document.getElementById('modalPrioridade').textContent = card.dataset.prioridade || 'Média';
  
    const disciplina = card.dataset.disciplina;
    if (disciplina && disciplina.trim() !== '') {
      document.getElementById('modalDisciplina').textContent = disciplina;
      document.getElementById('modalDisciplinaWrapper').style.display = 'block';
    } else {
      document.getElementById('modalDisciplinaWrapper').style.display = 'none';
    }
  
    document.getElementById('tarefaModal').style.display = 'flex';
  }
  
  function fecharModal() {
    document.getElementById('tarefaModal').style.display = 'none';
  }
  
  document.addEventListener('DOMContentLoaded', function () {
    // Arraste dos cards superiores da home
    const cardsSection = document.querySelector('.cards-section');
    if (cardsSection) {
      Sortable.create(cardsSection, {
        animation: 200,
        ghostClass: 'ghost-card',
        handle: '.card-header'
      });
    }
  
    // Arraste e persistência dos blocos principais da home
    const homeSections = document.getElementById('home-sections');
  
    if (homeSections) {
      // Reordena com base no que veio do banco
      fetch('/Projeto-Planner/Project/php/obter_layout_home.php')
        .then(res => res.json())
        .then(savedOrder => {
          if (Array.isArray(savedOrder)) {
            savedOrder.forEach(id => {
              const el = document.getElementById(id);
              if (el) homeSections.appendChild(el);
            });
          }
  
          // Ativa drag com salvamento
          Sortable.create(homeSections, {
            animation: 200,
            ghostClass: 'ghost-section',
            onEnd: function () {
              const order = Array.from(homeSections.children).map(el => el.id);
              fetch('/Projeto-Planner/Project/php/salvar_layout_home.php', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({ ordem: order })
              });
            }
          });
        });
    }
  });
  