function carregarDisciplinas(idSelecionado = null) {
  fetch('/Projeto-Planner/Project/php/get_disciplinas.php')
    .then(res => res.json())
    .then(disciplinas => {
      const select = document.getElementById('fk_id_disciplina');
      select.innerHTML = '<option value="">Selecionar disciplina (opcional)</option>';
      disciplinas.forEach(d => {
        const opt = document.createElement('option');
        opt.value = d.id_disciplina;
        opt.textContent = d.nome_disciplina;
        if (idSelecionado && d.id_disciplina == idSelecionado) {
          opt.selected = true;
        }
        select.appendChild(opt);
      });
    })
    .catch(err => {
      console.error('Erro ao carregar disciplinas:', err);
    });
}

function abrirPopup(tarefa = null) {
  const popup = document.getElementById("popup");
  popup.style.display = "flex";

  if (tarefa) {
    document.querySelector(".popup-header h3").textContent = "Editar Tarefa";
    document.querySelector("form").setAttribute("data-modo", "editar");
    document.querySelector("form").setAttribute("data-id", tarefa.id_tarefa);
    document.querySelector("form").setAttribute("data-dia", tarefa.dia);

    document.querySelector('input[name="nome_tarefa"]').value = tarefa.nome_tarefa;
    document.querySelector('textarea[name="descricao"]').value = tarefa.descricao || "";
    document.querySelector('select[name="prioridade"]').value = tarefa.prioridade;
    document.querySelector('input[name="hora_validade"]').value = tarefa.hora_validade || tarefa.hora;

    carregarDisciplinas(tarefa.fk_id_disciplina);

    document.querySelector(".criar-btn").textContent = "Atualizar tarefa";
  } else {
    document.querySelector(".popup-header h3").textContent = "Nova Tarefa";
    document.querySelector("form").setAttribute("data-modo", "criar");
    document.querySelector("form").removeAttribute("data-id");
    document.querySelector("form").removeAttribute("data-dia");
    document.querySelector(".criar-btn").textContent = "Criar tarefa";
    carregarDisciplinas();
  }
}

function fecharPopup() {
  document.getElementById("popup").style.display = "none";
  document.querySelector("form").reset();
}

function showAlert(mensagem, tipo = "success") {
  Swal.fire({
    icon: tipo,
    title: tipo === "success" ? "Sucesso" : "Erro",
    text: mensagem
  });
}

document.querySelector(".criar-btn").addEventListener("click", function (e) {
  e.preventDefault();

  const form = document.querySelector("form");
  const formData = new FormData(form);
  const modo = form.getAttribute("data-modo");

  const prioridade = formData.get("prioridade");
  if (prioridade) {
    const prioridadeNormalizada = prioridade.charAt(0).toUpperCase() + prioridade.slice(1).toLowerCase();
    formData.set("prioridade", prioridadeNormalizada);
  }

  let dia;
  if (modo === "editar") {
    dia = form.getAttribute("data-dia");
  } else {
    dia = document.querySelector("main")?.dataset?.dia;
  }

  if (!dia) {
    showAlert("Dia da semana não definido.", "error");
    return;
  }

  formData.append("dia", dia);
  let url = "/Projeto-Planner/Project/php/adicionar_tarefa.php";

  if (modo === "editar") {
    const id_tarefa = form.getAttribute("data-id");
    formData.append("id_tarefa", id_tarefa);
    url = "/Projeto-Planner/Project/php/atualizar_tarefa.php";
  }

  fetch(url, {
    method: "POST",
    body: formData,
  })
    .then((res) => res.json())
    .then((resposta) => {
      if (resposta.erro) {
        showAlert("Erro: " + resposta.erro, "error");
        return;
      }

      if (modo === "editar") {
        atualizarTarefaNoDOM(resposta);
        showAlert("Tarefa atualizada com sucesso!", "success");
        setTimeout(() => window.location.reload(), 1500);
      } else {
        resposta.dia = dia;
        adicionarTarefaNoDOM(resposta);
        showAlert("Tarefa criada com sucesso!", "success");
      }

      fecharPopup();
      form.reset();
    })
    .catch((err) => {
      console.error("Erro ao processar tarefa:", err);
      showAlert("Erro ao processar a tarefa.", "error");
    });
});

window.addEventListener("DOMContentLoaded", () => {
  const dia = document.querySelector("main")?.dataset?.dia;
  if (!dia) {
    showAlert("Dia da semana não definido.", "error");
    return;
  }

  fetch(`/Projeto-Planner/Project/php/buscar_tarefas.php?dia=${dia}`)
    .then((res) => res.json())
    .then((tarefas) => {
      if (!Array.isArray(tarefas)) {
        console.error("Resposta inválida da API:", tarefas);
        return;
      }
      tarefas.forEach((tarefa) => {
        tarefa.dia = dia;
        adicionarTarefaNoDOM(tarefa);
      });
    })
    .catch((err) => {
      console.error("Erro ao carregar tarefas:", err);
    });
});

function adicionarTarefaNoDOM(tarefa) {
  const div = document.createElement("div");
  div.className = `tarefa ${tarefa.prioridade}`;
  div.setAttribute("data-id", tarefa.id_tarefa);
  div.setAttribute("data-dia", tarefa.dia);

  const info = document.createElement("div");
  info.className = "info-tarefa";

  const nomeTarefa = document.createElement("span");
  nomeTarefa.className = "nome-tarefa";
  nomeTarefa.textContent = tarefa.nome_tarefa;

  const descricaoTarefa = document.createElement("div");
  descricaoTarefa.className = "descricao-tarefa";
  descricaoTarefa.textContent = tarefa.descricao || "";
  descricaoTarefa.style.display = "none";

  info.appendChild(nomeTarefa);
  info.appendChild(descricaoTarefa);

  const acoes = document.createElement("div");
  acoes.className = "acoes";

  const botaoEditar = document.createElement("button");
  botaoEditar.className = "botao-acao editar";
  botaoEditar.textContent = "Editar";
  botaoEditar.addEventListener("click", (event) => {
    event.stopPropagation();

    fetch(`/Projeto-Planner/Project/php/detalhes_tarefa.php?id_tarefa=${tarefa.id_tarefa}&dia=${tarefa.dia}&format=json`)
      .then((res) => res.json())
      .then((detalhes) => {
        if (detalhes.erro) {
          showAlert("Erro: " + detalhes.erro, "error");
          return;
        }
        abrirPopup(detalhes);
      })
      .catch((err) => {
        console.error("Erro ao carregar detalhes:", err);
        showAlert("Erro ao carregar detalhes para edição.", "error");
      });
  });

  const botaoExcluir = document.createElement("button");
  botaoExcluir.className = "botao-acao excluir";
  botaoExcluir.textContent = "Excluir";
  botaoExcluir.addEventListener("click", (event) => {
    event.stopPropagation();

    Swal.fire({
      title: "Tem certeza?",
      text: "Essa ação não poderá ser desfeita.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#aaa",
      confirmButtonText: "Sim, excluir!",
      cancelButtonText: "Cancelar"
    }).then((result) => {
      if (!result.isConfirmed) return;

      fetch("/Projeto-Planner/Project/php/remover_tarefa.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `id_tarefa=${tarefa.id_tarefa}&dia=${tarefa.dia}`,
      })
        .then((res) => res.json())
        .then((resposta) => {
          if (resposta.sucesso) {
            div.remove();
            showAlert("Tarefa removida com sucesso!", "success");
          } else {
            showAlert(resposta.erro || "Erro ao remover tarefa", "error");
          }
        })
        .catch(() => {
          showAlert("Erro de conexão ao remover tarefa.", "error");
        });
    });
  });

  const horaSpan = document.createElement("span");
  horaSpan.className = "hora";
  horaSpan.textContent = tarefa.hora_validade || tarefa.hora;

  acoes.appendChild(botaoEditar);
  acoes.appendChild(botaoExcluir);
  acoes.appendChild(horaSpan);

  div.appendChild(info);
  div.appendChild(acoes);

  div.addEventListener("click", () => {
    const jaExiste = div.querySelector(".detalhes-tarefa");
    if (jaExiste) {
      jaExiste.classList.remove("mostrar");
      setTimeout(() => jaExiste.remove(), 500); // aguarda a animação antes de remover
      return;
    }
  
    fetch(`/Projeto-Planner/Project/php/detalhes_tarefa.php?id_tarefa=${tarefa.id_tarefa}&dia=${tarefa.dia}`)
      .then((res) => res.text())
      .then((html) => {
        const detalhes = document.createElement("div");
        detalhes.className = "detalhes-tarefa";
        detalhes.innerHTML = html;
        div.appendChild(detalhes);
  
        // Garante que a animação aconteça
        requestAnimationFrame(() => {
          detalhes.classList.add("mostrar");
        });
      })
      .catch(() => {
        showAlert("Erro ao carregar detalhes da tarefa.", "error");
      });
  });
  

  document.getElementById("lista-tarefas").appendChild(div);
}

function atualizarTarefaNoDOM(tarefa) {
  const tarefaElement = document.querySelector(`.tarefa[data-id="${tarefa.id_tarefa}"][data-dia="${tarefa.dia}"]`);
  if (!tarefaElement) return;

  const prioridadeAtual = tarefaElement.className.split(' ')
    .filter(cls => !['Alta', 'Media', 'Baixa'].includes(cls))
    .join(' ');

  tarefaElement.className = `${prioridadeAtual} ${tarefa.prioridade}`;

  const nomeTarefaElement = tarefaElement.querySelector(".nome-tarefa");
  if (nomeTarefaElement) {
    nomeTarefaElement.textContent = tarefa.nome_tarefa;
  }

  const descricaoTarefaElement = tarefaElement.querySelector(".descricao-tarefa");
  if (descricaoTarefaElement) {
    descricaoTarefaElement.textContent = tarefa.descricao || "";
    descricaoTarefaElement.style.display = "none";
  }

  const horaElement = tarefaElement.querySelector(".hora");
  if (horaElement) {
    horaElement.textContent = tarefa.hora_validade || tarefa.hora;
  }

  const detalhes = tarefaElement.querySelector(".detalhes-tarefa");
  if (detalhes) {
    detalhes.remove();
  }
}
