// === Mapeamento de RA ===
let idRaSelecionado = null;
let idRaMap = {}; // mapeia ra_nome -> id_ra
const urlParams = new URLSearchParams(window.location.search);
const idDisciplinaSelecionada = urlParams.get("id_disciplina");

// === Adicionar novo RA e exibir na tela ===
document.getElementById("btn-adicionar-ra").addEventListener("click", () => {
    const raNome = document.getElementById("novo-ra-nome").value.trim();
    const raPeso = document.getElementById("novo-ra-peso").value;

    if (!raNome || !raPeso) {
        alert("Preencha o nome e o peso do RA.");
        return;
    }

    fetch("/Projeto-Planner/Project/php/salvar_ra.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
            ra_nome: raNome,
            ra_peso: raPeso,
            id_disciplina: idDisciplinaSelecionada
        })
    })
    .then(res => res.json())
    .then(data => {
        alert(data.message);
        if (data.success) {
            adicionarRAnaInterface(raNome, raPeso, [], [], data.id_ra);
            document.getElementById("novo-ra-nome").value = "";
            document.getElementById("novo-ra-peso").value = 10;
        }
    })
    .catch(error => {
        console.error("Erro ao salvar RA:", error);
        alert("Erro ao salvar RA.");
    });
});

function adicionarRAnaInterface(nome, peso, provas = [], trabalhos = [], id_ra = null) {
    const listaRAs = document.getElementById("lista-ras");

    const raContainer = document.createElement("div");
    raContainer.className = "ra-item";
    raContainer.style.backgroundColor = "#edf6ff";
    raContainer.style.padding = "16px";
    raContainer.style.marginBottom = "10px";
    raContainer.style.borderRadius = "12px";
    raContainer.style.display = "flex";
    raContainer.style.flexDirection = "column";

    const header = document.createElement("div");
    header.style.display = "flex";
    header.style.justifyContent = "space-between";
    header.style.alignItems = "center";
    header.style.width = "100%";

    const infoDiv = document.createElement("div");
    const raTitulo = document.createElement("h4");
    raTitulo.textContent = nome;
    const raPeso = document.createElement("p");
    raPeso.textContent = `Porcentagem: ${peso}%`;
    infoDiv.appendChild(raTitulo);
    infoDiv.appendChild(raPeso);

    const btnsDiv = document.createElement("div");

    const btnNotas = document.createElement("button");
    btnNotas.textContent = "Lançar Notas";
    btnNotas.className = "btn btn-azul";
    btnNotas.style.marginRight = "10px";
    btnNotas.onclick = () => abrirModalNotas(nome);

    const btnRemover = document.createElement("button");
    btnRemover.textContent = "Remover";
    btnRemover.className = "btn btn-vermelho";
    btnRemover.onclick = () => {
        if (confirm("Tem certeza que deseja remover este RA?")) {
            fetch("/Projeto-Planner/Project/php/remover_ra.php", {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: new URLSearchParams({ id_ra: id_ra })
            })
            .then(res => res.text())
            .then(data => {
                alert(data);
                if (data.includes("sucesso")) {
                    raContainer.remove();
                    window.location.reload();
                }
            })
            .catch(error => {
                console.error("Erro ao remover RA:", error);
                alert("Erro ao remover RA.");
            });
        }
    };
    

    btnsDiv.appendChild(btnNotas);
    btnsDiv.appendChild(btnRemover);

    header.appendChild(infoDiv);
    header.appendChild(btnsDiv);
    raContainer.appendChild(header);

    // Mapeia nome para ID
    if (id_ra) idRaMap[nome] = id_ra;

    const renderNotas = (items, tipo) => {
        const list = document.createElement("ul");
        list.style.marginTop = "5px";
        list.style.listStyle = "none";
        items.forEach(item => {
            const nota = parseFloat(item.nota);
            const peso = parseFloat(item.peso || 1);
            const notaCorrigida = nota > 10 ? nota / 10 : nota;
            const notaFormatada = notaCorrigida.toFixed(2);
            const cor = notaCorrigida >= 7 ? "green" : "red";

            const li = document.createElement("li");
            li.innerHTML = `${tipo}: ${item.nome_prova || item.nome_trabalho} - Nota: <span style="color:${cor}">${notaFormatada} - Peso: ${item.peso}%</span>`;
            list.appendChild(li);
        });
        return list;
    };

    if (provas.length) raContainer.appendChild(renderNotas(provas, "Prova"));
    if (trabalhos.length) raContainer.appendChild(renderNotas(trabalhos, "Trabalho"));

    let somaNotasPonderadas = 0, somaPesos = 0;
    [...provas, ...trabalhos].forEach(item => {
        const nota = parseFloat(item.nota);
        const peso = parseFloat(item.peso || 1);
        const notaCorrigida = nota > 10 ? nota / 10 : nota;
        somaNotasPonderadas += notaCorrigida * peso;
        somaPesos += peso;
    });

    if (somaPesos > 0) {
        const mediaRA = somaNotasPonderadas / somaPesos;
        const mediaFormatada = mediaRA.toFixed(2);
        const cor = mediaRA >= 7 ? "green" : "red";
        const mediaEl = document.createElement("p");
        mediaEl.innerHTML = `Média Final do RA: <strong class="media-ra" style="color:${cor}">${mediaFormatada}</strong>`;
        mediaEl.style.marginTop = "10px";
        raContainer.appendChild(mediaEl);
    }

    listaRAs.appendChild(raContainer);
    atualizarMediaFinal();


}

function abrirModalNotas(raNome) {
    document.getElementById("modal-overlay").style.display = "block";
    document.getElementById("modal-titulo").textContent = raNome;
    idRaSelecionado = raNome;
}

document.getElementById("btn-cancelar").addEventListener("click", () => {
    document.getElementById("modal-overlay").style.display = "none";
    document.getElementById("lista-provas").innerHTML = "";
    document.getElementById("lista-trabalhos").innerHTML = "";
    document.getElementById("provas-adicionadas").style.display = "none";
    document.getElementById("trabalhos-adicionados").style.display = "none";
});

document.getElementById("btn-adicionar-prova").addEventListener("click", () => {
    const nome = document.getElementById("nova-prova-nome").value;
    const nota = document.getElementById("nova-prova-valor").value;
    const peso = document.getElementById("nova-prova-peso").value;

    if (!nome || nota === "" || peso === "") {
        alert("Preencha todos os campos da prova.");
        return;
    }

    const li = document.createElement("li");
    li.textContent = `${nome} - Nota: ${nota} - Peso: ${peso}`;
    li.dataset.nome = nome;
    li.dataset.nota = nota;
    li.dataset.peso = peso;

    document.getElementById("lista-provas").appendChild(li);
    document.getElementById("provas-adicionadas").style.display = "block";

    document.getElementById("nova-prova-nome").value = "";
    document.getElementById("nova-prova-valor").value = "";
    document.getElementById("nova-prova-peso").value = 1;
});

document.getElementById("btn-adicionar-trabalho").addEventListener("click", () => {
    const nome = document.getElementById("novo-trabalho-nome").value;
    const nota = document.getElementById("novo-trabalho-valor").value;
    const peso = document.getElementById("novo-trabalho-peso").value;

    if (!nome || nota === "" || peso === "") {
        alert("Preencha todos os campos do trabalho.");
        return;
    }

    const li = document.createElement("li");
    li.textContent = `${nome} - Nota: ${nota} - Peso: ${peso}`;
    li.dataset.nome = nome;
    li.dataset.nota = nota;
    li.dataset.peso = peso;

    document.getElementById("lista-trabalhos").appendChild(li);
    document.getElementById("trabalhos-adicionados").style.display = "block";

    document.getElementById("novo-trabalho-nome").value = "";
    document.getElementById("novo-trabalho-valor").value = "";
    document.getElementById("novo-trabalho-peso").value = 1;
});

document.getElementById("btn-salvar").addEventListener("click", () => {
    const provas = [], trabalhos = [];

    document.querySelectorAll("#lista-provas li").forEach(li => {
        provas.push({
            nome: li.dataset.nome,
            nota: parseFloat(li.dataset.nota),
            peso: parseInt(li.dataset.peso)
        });
    });

    document.querySelectorAll("#lista-trabalhos li").forEach(li => {
        trabalhos.push({
            nome: li.dataset.nome,
            nota: parseFloat(li.dataset.nota),
            peso: parseInt(li.dataset.peso)
        });
    });

    const id_ra = idRaMap[idRaSelecionado];
    if (!id_ra) {
        alert("Erro: ID do RA não encontrado.");
        return;
    }

    fetch("/Projeto-Planner/Project/php/salvar_avaliacoes.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
            id_ra,
            provas: JSON.stringify(provas),
            trabalhos: JSON.stringify(trabalhos)
        })
    })
    .then(res => res.text())
    .then(data => {
        alert(data);
        document.getElementById("modal-overlay").style.display = "none";
        window.location.reload()
    })
    .catch(error => {
        console.error("Erro ao salvar avaliações:", error);
        alert("Erro ao salvar provas/trabalhos.");
    });
});


window.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const idDisciplinaSelecionada = urlParams.get("id_disciplina");

    fetch(`/Projeto-Planner/Project/php/listar_ras.php?id_disciplina=${idDisciplinaSelecionada}`)
    .then(res => res.json())
    .then(ras => {
        if (!Array.isArray(ras)) {
            console.error("Erro ao carregar RAs: resposta não é uma lista", ras);
            return;
        }

        ras.forEach(ra => {
            adicionarRAnaInterface(ra.nome_ra, ra.peso_ra, ra.provas, ra.trabalhos, ra.id_ra);
        });
    })
    .catch(error => {
        console.error("Erro ao carregar RAs:", error);
    });

});


function atualizarMediaFinal() {
    let somaMediasPonderadas = 0;
    let somaPesos = 0;

    document.querySelectorAll(".ra-item").forEach(raItem => {
        const mediaText = raItem.querySelector("strong.media-ra");
        if (!mediaText) return;

        const media = parseFloat(mediaText.textContent.replace(",", "."));
        const pesoText = raItem.querySelector("p").textContent;
        const peso = parseInt(pesoText.match(/\d+/)[0]);

        somaMediasPonderadas += media * peso;
        somaPesos += peso;
    });

    let mediaFinal = 0;
    if (somaPesos > 0) {
        mediaFinal = somaMediasPonderadas / somaPesos;
    }

    const mediaFinalEl = document.getElementById("media-final");
    const statusEl = document.getElementById("status-aluno");

    mediaFinalEl.textContent = mediaFinal.toFixed(2);

    if (mediaFinal >= 7) {
        statusEl.textContent = "Aprovado";
        statusEl.classList.remove("status-reprovado");
        statusEl.classList.add("status-aprovado");
    } else {
        statusEl.textContent = "Reprovado";
        statusEl.classList.remove("status-aprovado");
        statusEl.classList.add("status-reprovado");
    }
    
    // 🆕 Enviar média final para o servidor
    fetch('/Projeto-Planner/Project/php/atualizar_nota_disciplina.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            id_disciplina: idDisciplinaSelecionada,
            nota: mediaFinal.toFixed(2)
        })
    })
    .then(response => response.json())
    .then(data => {
        console.log("Nota atualizada com sucesso:", data);
    })
    .catch(error => {
        console.error("Erro ao atualizar nota:", error);
    });
}

