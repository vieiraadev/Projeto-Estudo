fetch("/Projeto-Planner/Project/php/listar_disciplinas_notas.php")
    .then(res => res.json())
    .then(data => {
        if (!data.success || !Array.isArray(data.disciplinas)) {
            throw new Error("A resposta não é um array");
        }

        const lista = document.getElementById("lista-disciplinas");
        data.disciplinas.forEach(disciplina => {
            const li = document.createElement("li");

            const link = document.createElement("a");
            link.href = `/Projeto-Planner/Project/html/notas.html?id_disciplina=${disciplina.id_disciplina}`;
            link.textContent = disciplina.nome_disciplina;

            li.appendChild(link);
            lista.appendChild(li);
        });
    })
    .catch(error => {
        console.error("Erro ao carregar disciplinas:", error);
    });
