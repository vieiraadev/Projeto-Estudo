

 
    // Função para criar um card de disciplina
    function criarCardDisciplina(disciplina) {
        const card = document.createElement('div');
        card.className = 'discipline-card';

        const nomeDiv = document.createElement('div');
        nomeDiv.className = 'discipline-name';
        nomeDiv.textContent = disciplina.nome_disciplina;

        const btn = document.createElement('button');
        btn.className = 'view-grades-btn';
        btn.textContent = 'Lançar Notas';
        btn.onclick = () => {
            // Ao clicar, redireciona para a página notas com o id da disciplina na URL
            window.location.href = `/Projeto-Planner/Project/html/notas.html?id_disciplina=${disciplina.id_disciplina}`;
        };

        card.appendChild(nomeDiv);
        card.appendChild(btn);

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
