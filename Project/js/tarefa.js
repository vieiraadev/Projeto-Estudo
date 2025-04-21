function abrirPopup() {
  document.getElementById("popup").style.display = "flex";
}

function fecharPopup() {
  document.getElementById("popup").style.display = "none";
}

document.querySelector(".criar-btn").addEventListener("click", function (e) {
  e.preventDefault();

  const form = document.querySelector("form");
  const formData = new FormData(form);

  const dia = document.querySelector("main")?.dataset?.dia;
  if (!dia) {
    alert("Dia da semana não definido.");
    return;
  }
  formData.append("dia", dia);

  fetch("/Projeto-Planner/Project/php/adicionar_tarefa.php", {
    method: "POST",
    body: formData,
  })
    .then((res) => res.json())
    .then((tarefa) => {
      if (tarefa.erro) {
        alert("Erro: " + tarefa.erro);
        return;
      }

      tarefa.dia = dia; // Salvar o dia para uso posterior (exclusão)
      adicionarTarefaNoDOM(tarefa);
      fecharPopup();
      form.reset();

      const aviso = document.createElement("div");
      aviso.textContent = "Tarefa enviada!";
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
      console.error("Erro ao enviar tarefa:", err);
      alert("Erro ao enviar tarefa.");
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

  const info = document.createElement("div");
  info.className = "info-tarefa";

  const nomeTarefa = document.createElement("span");
  nomeTarefa.className = "nome-tarefa";
  nomeTarefa.textContent = tarefa.nome_tarefa;

  const descricaoTarefa = document.createElement("div");
  descricaoTarefa.className = "descricao-tarefa";
  descricaoTarefa.textContent = tarefa.descricao || "";

  info.appendChild(nomeTarefa);
  info.appendChild(descricaoTarefa);

  const acoes = document.createElement("div");
  acoes.className = "acoes";

  const botao = document.createElement("button");
  botao.className = "botao-acao";
  botao.textContent = "Excluir";
  botao.addEventListener("click", (event) => {
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
  horaSpan.textContent = tarefa.hora;

  acoes.appendChild(botao);
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
