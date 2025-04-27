function abrirPopup(tarefa = null) {
  const popup = document.getElementById("popup");
  popup.style.display = "flex";
  
  // Se tiver uma tarefa, preenche o formulário para edição
  if (tarefa) {
    document.querySelector(".popup-header h3").textContent = "Editar Tarefa";
    document.querySelector("form").setAttribute("data-modo", "editar");
    document.querySelector("form").setAttribute("data-id", tarefa.id_tarefa);
    document.querySelector("form").setAttribute("data-dia", tarefa.dia);
    
    // Preencher os campos com os dados da tarefa
    document.querySelector('input[name="nome_tarefa"]').value = tarefa.nome_tarefa;
    document.querySelector('textarea[name="descricao"]').value = tarefa.descricao || "";
    document.querySelector('select[name="prioridade"]').value = tarefa.prioridade;
    document.querySelector('input[name="hora_validade"]').value = tarefa.hora_validade || tarefa.hora;
    
    // Mudar o texto do botão
    document.querySelector(".criar-btn").textContent = "Atualizar tarefa";
  } else {
    // Modo criação
    document.querySelector(".popup-header h3").textContent = "Nova Tarefa";
    document.querySelector("form").setAttribute("data-modo", "criar");
    document.querySelector("form").removeAttribute("data-id");
    document.querySelector("form").removeAttribute("data-dia");
    document.querySelector(".criar-btn").textContent = "Criar tarefa";
  }
}

function fecharPopup() {
  document.getElementById("popup").style.display = "none";
  document.querySelector("form").reset();
}

document.querySelector(".criar-btn").addEventListener("click", function (e) {
  e.preventDefault();

  const form = document.querySelector("form");
  const formData = new FormData(form);
  const modo = form.getAttribute("data-modo");

  // Normalizar a prioridade para garantir consistência
  const prioridade = formData.get("prioridade");
  if (prioridade) {
    // Certifique-se que a primeira letra é maiúscula e o resto minúsculo
    const prioridadeNormalizada = prioridade.charAt(0).toUpperCase() + prioridade.slice(1).toLowerCase();
    formData.set("prioridade", prioridadeNormalizada);
  }

  // Obter o dia da página ou do formulário para edição
  let dia;
  if (modo === "editar") {
    dia = form.getAttribute("data-dia");
  } else {
    dia = document.querySelector("main")?.dataset?.dia;
  }

  if (!dia) {
    alert("Dia da semana não definido.");
    return;
  }
  formData.append("dia", dia);

  // URL diferente dependendo se é criação ou edição
  let url = "/Projeto-Planner/Project/php/adicionar_tarefa.php";
  
  // Se for edição, adiciona o ID da tarefa e muda a URL
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
        alert("Erro: " + resposta.erro);
        return;
      }

      // Se for edição, atualiza a tarefa na tela
      if (modo === "editar") {
        atualizarTarefaNoDOM(resposta);
        window.location.reload();
      } else {
        // Se for criação, adiciona nova tarefa
        resposta.dia = dia;
        adicionarTarefaNoDOM(resposta);
      }
      
      fecharPopup();
      form.reset();

      const aviso = document.createElement("div");
      aviso.textContent = modo === "editar" ? "Tarefa atualizada!" : "Tarefa enviada!";
      aviso.style.position = "fixed";
      aviso.style.top = "1rem";
      aviso.style.right = "1rem";
      aviso.style.background = "#4CAF50";
      aviso.style.color = "white";
      aviso.style.padding = "10px 15px";
      aviso.style.borderRadius = "5px";
      aviso.style.boxShadow = "0 0 10px rgba(0,0,0,0.2)";
      document.body.appendChild(aviso);

      setTimeout(() => aviso.remove(), 3000);
    })
    .catch((err) => {
      console.error("Erro ao processar tarefa:", err);
      alert("Erro ao processar a tarefa.");
    });
});

window.addEventListener("DOMContentLoaded", () => {
  const dia = document.querySelector("main")?.dataset?.dia;
  if (!dia) {
    alert("Dia da semana não definido.");
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
        tarefa.dia = dia; // Adiciona o dia dinamicamente
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
  descricaoTarefa.style.display = "none"; // Ocultar a descrição por padrão

  info.appendChild(nomeTarefa);
  info.appendChild(descricaoTarefa);

  const acoes = document.createElement("div");
  acoes.className = "acoes";

  // Botão de editar
  const botaoEditar = document.createElement("button");
  botaoEditar.className = "botao-acao editar";
  botaoEditar.textContent = "Editar";
  botaoEditar.addEventListener("click", (event) => {
    event.stopPropagation();
    
    // Buscar detalhes completos da tarefa para edição
    fetch(`/Projeto-Planner/Project/php/detalhes_tarefa.php?id_tarefa=${tarefa.id_tarefa}&dia=${tarefa.dia}&format=json`)
      .then((res) => res.json())
      .then((detalhes) => {
        if (detalhes.erro) {
          alert("Erro: " + detalhes.erro);
          return;
        }
        abrirPopup(detalhes);
      })
      .catch((err) => {
        console.error("Erro ao carregar detalhes:", err);
        alert("Erro ao carregar detalhes para edição.");
      });
  });

  // Botão de excluir
  const botaoExcluir = document.createElement("button");
  botaoExcluir.className = "botao-acao excluir";
  botaoExcluir.textContent = "Excluir";
  botaoExcluir.addEventListener("click", (event) => {
    event.stopPropagation();
    if (!confirm("Tem certeza que deseja excluir esta tarefa?")) return;

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
        } else {
          alert(resposta.erro || "Erro ao remover tarefa");
        }
      })
      .catch(() => alert("Erro de conexão ao remover tarefa."));
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
      jaExiste.remove();
      return;
    }

    fetch(`/Projeto-Planner/Project/php/detalhes_tarefa.php?id_tarefa=${tarefa.id_tarefa}&dia=${tarefa.dia}`)
      .then((res) => res.text())
      .then((html) => {
        const detalhes = document.createElement("div");
        detalhes.className = "detalhes-tarefa";
        detalhes.innerHTML = html;
        div.appendChild(detalhes);
      })
      .catch(() => {
        alert("Erro ao carregar detalhes da tarefa.");
      });
  });

  document.getElementById("lista-tarefas").appendChild(div);
}

function atualizarTarefaNoDOM(tarefa) {
  const tarefaElement = document.querySelector(`.tarefa[data-id="${tarefa.id_tarefa}"][data-dia="${tarefa.dia}"]`);
  if (!tarefaElement) return;
  
  // Atualizar classe de prioridade
  const prioridadeAtual = tarefaElement.className.split(' ')
    .filter(cls => !['Alta', 'Media', 'Baixa'].includes(cls))
    .join(' ');
  
  tarefaElement.className = `${prioridadeAtual} ${tarefa.prioridade}`;
  
  // Atualizar apenas o nome da tarefa, sem mostrar a descrição
  const nomeTarefaElement = tarefaElement.querySelector(".nome-tarefa");
  if (nomeTarefaElement) {
    nomeTarefaElement.textContent = tarefa.nome_tarefa;
  }
  
  // Manter a descrição oculta, apenas atualizando seu conteúdo
  const descricaoTarefaElement = tarefaElement.querySelector(".descricao-tarefa");
  if (descricaoTarefaElement) {
    descricaoTarefaElement.textContent = tarefa.descricao || "";
    descricaoTarefaElement.style.display = "none";
  }
  
  // Atualizar a hora
  const horaElement = tarefaElement.querySelector(".hora");
  if (horaElement) {
    horaElement.textContent = tarefa.hora_validade || tarefa.hora;
  }
  
  // Remover detalhes expandidos se estiverem abertos
  const detalhes = tarefaElement.querySelector(".detalhes-tarefa");
  if (detalhes) {
    detalhes.remove();
  }
}