function abrirPopup() {
  document.getElementById("popup").style.display = "flex";
}

function fecharPopup() {
  document.getElementById("popup").style.display = "none";
}
document.querySelector(".criar-btn").addEventListener("click", function (e) {
  e.preventDefault(); // Impede o envio tradicional do form

  const form = document.querySelector("form");
  const formData = new FormData(form);

  fetch("/Projeto-Planner/Project/php/adicionar_tarefa.php", {
    method: "POST",
    body: formData,
  })
    .then((res) => res.json())
    .then((tarefa) => {
      // Cria a tarefa dinamicamente
      const div = document.createElement("div");
      div.classList.add("tarefa", tarefa.prioridade.toLowerCase());
      div.innerHTML = `
        ${tarefa.nome_tarefa}
        <span class="hora">${tarefa.hora}</span>
      `;
      document.getElementById("lista-tarefas").appendChild(div);

      fecharPopup();
      form.reset();

      // Notificação
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
