// Função para criar um card de disciplina
function criarCardDisciplina(disciplina) {
    const card = document.createElement('div');
    card.className = 'discipline-card';

    const nomeDiv = document.createElement('div');
    nomeDiv.className = 'discipline-name';
    nomeDiv.textContent = disciplina.nome_disciplina;

    const botoesContainer = document.createElement('div');
    botoesContainer.className = 'discipline-buttons';

    const btnNotas = document.createElement('button');
    btnNotas.className = 'view-grades-btn';
    btnNotas.textContent = 'Lançar Notas';
    btnNotas.onclick = () => {
        window.location.href = `/Projeto-Planner/Project/html/notas.html?id_disciplina=${disciplina.id_disciplina}`;
    };

    const btnTarefas = document.createElement('button');
    btnTarefas.className = 'view-tasks-btn';
    btnTarefas.textContent = 'Ver Tarefas';
    btnTarefas.onclick = () => {
        abrirPopupTarefas(disciplina.id_disciplina, disciplina.nome_disciplina);
    };

    botoesContainer.appendChild(btnNotas);
    botoesContainer.appendChild(btnTarefas);

    card.appendChild(nomeDiv);
    card.appendChild(botoesContainer);

    return card;
}

// Carrega disciplinas via fetch e popula os cards
fetch('/Projeto-Planner/Project/php/listar_disciplinas_notas.php')
    .then(res => res.json())
    .then(data => {
        if (!data.success || !Array.isArray(data.disciplinas)) {
            throw new Error('Erro ao carregar disciplinas');
        }
        const grid = document.getElementById('disciplinesGrid');
        data.disciplinas.forEach(disciplina => {
            const card = criarCardDisciplina(disciplina);
            grid.appendChild(card);
        });
    })
    .catch(err => {
        console.error('Erro:', err);
        const grid = document.getElementById('disciplinesGrid');
        grid.textContent = 'Erro ao carregar disciplinas.';
    });

// Função para abrir o pop-up centralizado com as tarefas
function abrirPopupTarefas(idDisciplina, nomeDisciplina) {
    const popup = document.getElementById('popup-tarefas');
    const titulo = document.getElementById('titulo-popup-tarefas');
    const conteudo = document.getElementById('popup-tarefas-conteudo');


    titulo.textContent = `Tarefas de: ${nomeDisciplina}`;
    conteudo.innerHTML = 'Carregando tarefas...';
    popup.style.display = 'flex';

    fetch(`/Projeto-Planner/Project/php/listar_tarefa_disciplina.php?id_disciplina=${idDisciplina}`)
        .then(res => res.json())
        .then(tarefas => {
            conteudo.innerHTML = '';
            if (tarefas.length === 0) {
                conteudo.innerHTML = '<p>Nenhuma tarefa encontrada.</p>';
            } else {
                tarefas.forEach(tarefa => {
                    const el = document.createElement('div');
                    el.className = 'tarefa-listada';
                    el.textContent = tarefa.nome_tarefa;
                    el.onclick = () => {
                        const url = `/Projeto-Planner/Project/html/home.html?dia=${encodeURIComponent(tarefa.dia_da_semana)}&scrollTo=${encodeURIComponent(tarefa.id_tarefa)}`;
                        window.location.href = url;
                    };
                    conteudo.appendChild(el);
                });
            }
        })
        .catch(err => {
            conteudo.innerHTML = '<p>Erro ao buscar tarefas.</p>';
            console.error(err);
        });
}

// Função para fechar o pop-up
function fecharPopupTarefas() {
    document.getElementById('popup-tarefas').style.display = 'none';
}
