let idRaSelecionado = null;
let idRaMap = {};
let idRaAtivo = null;
const urlParams = new URLSearchParams(window.location.search);
const idDisciplinaSelecionada = urlParams.get("id_disciplina");

document.getElementById("btn-adicionar-ra").addEventListener("click", () => {
    const raNome = document.getElementById("novo-ra-nome").value.trim();
    const raPeso = document.getElementById("novo-ra-peso").value;

    if (!raNome || !raPeso) {
        Swal.fire("Atenção", "Preencha o nome e o peso do RA.", "warning");
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
        Swal.fire("Resultado", data.message, data.success ? "success" : "error");
        if (data.success) {
            adicionarRAnaInterface(raNome, raPeso, [], [], data.id_ra);
            document.getElementById("novo-ra-nome").value = "";
            document.getElementById("novo-ra-peso").value = 10;
        }
    })
    .catch(error => {
        console.error("Erro ao salvar RA:", error);
        Swal.fire("Erro", "Erro ao salvar RA.", "error");
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
        Swal.fire({
            title: "Tem certeza?",
            text: "Deseja remover este RA?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Sim",
            cancelButtonText: "Cancelar"
        }).then(result => {
            if (result.isConfirmed) {
                fetch("/Projeto-Planner/Project/php/remover_ra.php", {
                    method: "POST",
                    headers: { "Content-Type": "application/x-www-form-urlencoded" },
                    body: new URLSearchParams({ id_ra: id_ra })
                })
                .then(res => res.text())
                .then(data => {
                    Swal.fire("Resultado", data, data.includes("sucesso") ? "success" : "error");
                    if (data.includes("sucesso")) {
                        raContainer.remove();
                        window.location.reload();
                    }
                })
                .catch(error => {
                    console.error("Erro ao remover RA:", error);
                    Swal.fire("Erro", "Erro ao remover RA.", "error");
                });
            }
        });
    };

    btnsDiv.appendChild(btnNotas);
    btnsDiv.appendChild(btnRemover);

    header.appendChild(infoDiv);
    header.appendChild(btnsDiv);
    raContainer.appendChild(header);

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
    document.getElementById("modal-overlay").style.display = "flex";
    document.getElementById("modal-titulo").textContent = raNome;
    idRaSelecionado = raNome;
    idRaAtivo = idRaMap[raNome];

    document.getElementById("lista-provas").innerHTML = "";
    document.getElementById("lista-trabalhos").innerHTML = "";
    document.getElementById("provas-adicionadas").style.display = "none";
    document.getElementById("trabalhos-adicionados").style.display = "none";

    fetch(`/Projeto-Planner/Project/php/get_avaliacoes.php?id_ra=${idRaAtivo}`)
    .then(res => res.json())
    .then(data => {
        if (data.provas?.length) {
            data.provas.forEach(p => {
                const li = document.createElement("li");
                li.textContent = `${p.nome_prova} - Nota: ${p.nota} - Peso: ${p.peso}`;
                li.dataset.nome = p.nome_prova;
                li.dataset.nota = p.nota;
                li.dataset.peso = p.peso;
                document.getElementById("lista-provas").appendChild(li);
                document.getElementById("provas-adicionadas").style.display = "block";
            });
        }
        if (data.trabalhos?.length) {
            data.trabalhos.forEach(t => {
                const li = document.createElement("li");
                li.textContent = `${t.nome_trabalho} - Nota: ${t.nota} - Peso: ${t.peso}`;
                li.dataset.nome = t.nome_trabalho;
                li.dataset.nota = t.nota;
                li.dataset.peso = t.peso;
                document.getElementById("lista-trabalhos").appendChild(li);
                document.getElementById("trabalhos-adicionados").style.display = "block";
            });
        }
    });
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
        Swal.fire("Atenção", "Preencha todos os campos da prova.", "warning");
        return;
    }

    const lista = document.getElementById("lista-provas");
    for (const li of lista.querySelectorAll("li")) {
        if (li.dataset.nome === nome) {
            Swal.fire("Erro", "Já existe uma prova com esse nome.", "error");
            return;
        }
    }

    const li = document.createElement("li");
    li.textContent = `${nome} - Nota: ${nota} - Peso: ${peso}`;
    li.dataset.nome = nome;
    li.dataset.nota = nota;
    li.dataset.peso = peso;
    lista.appendChild(li);
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
        Swal.fire("Atenção", "Preencha todos os campos do trabalho.", "warning");
        return;
    }

    const lista = document.getElementById("lista-trabalhos");
    for (const li of lista.querySelectorAll("li")) {
        if (li.dataset.nome === nome) {
            Swal.fire("Erro", "Já existe um trabalho com esse nome.", "error");
            return;
        }
    }

    const li = document.createElement("li");
    li.textContent = `${nome} - Nota: ${nota} - Peso: ${peso}`;
    li.dataset.nome = nome;
    li.dataset.nota = nota;
    li.dataset.peso = peso;
    lista.appendChild(li);
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

    const id_ra = idRaAtivo;
    if (!id_ra) {
        Swal.fire("Erro", "ID do RA não encontrado.", "error");
        return;
    }

    fetch("/Projeto-Planner/Project/php/salvar_avaliacoes.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
            id_ra: idRaAtivo,
            provas: JSON.stringify(provas),
            trabalhos: JSON.stringify(trabalhos)
        })
    })
    .then(res => res.json())
    .then(data => {
        Swal.fire("Resultado", data.message, data.success ? "success" : "error").then(() => {
            document.getElementById("modal-overlay").style.display = "none";
            window.location.reload();
        });
    })
    .catch(error => {
        console.error("Erro ao salvar avaliações:", error);
        Swal.fire("Erro", "Erro ao salvar provas/trabalhos.", "error");
    });
});

window.addEventListener("DOMContentLoaded", () => {
    fetch(`/Projeto-Planner/Project/php/listar_ras.php?id_disciplina=${idDisciplinaSelecionada}`)
    .then(res => res.json())
    .then(ras => {
        if (!Array.isArray(ras)) {
            console.error("Erro ao carregar RAs: resposta não é uma lista", ras);
            atualizarMediaFinal();
            return;
        }

        ras.forEach(ra => {
            adicionarRAnaInterface(ra.nome_ra, ra.peso_ra, ra.provas, ra.trabalhos, ra.id_ra);
        });

        atualizarMediaFinal();
    })
    .catch(error => {
        console.error("Erro ao carregar RAs:", error);
        atualizarMediaFinal();
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

    fetch('/Projeto-Planner/Project/php/atualizar_nota_disciplina.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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