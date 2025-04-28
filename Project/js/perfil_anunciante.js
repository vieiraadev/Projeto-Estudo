function mostrarNotificacao(mensagem, erro = false) {
  const notif = document.getElementById("notification");
  notif.textContent = mensagem;
  notif.style.backgroundColor = erro ? "#e74c3c" : "#2ecc71"; // vermelho para erro, verde para sucesso
  notif.classList.add("show");
  setTimeout(() => notif.classList.remove("show"), 2500);
}

document.addEventListener("DOMContentLoaded", () => {
  fetch("/Projeto-Planner/Project/php/buscardados_anunciante.php")
    .then(res => res.json())
    .then(dados => {
      if (dados.erro) {
        console.error(dados.erro);
        return;
      }

      document.getElementById("nome-atual").textContent = dados.nome;
      document.getElementById("email-atual").textContent = dados.email;
      document.getElementById("cpf-cnpj-atual").textContent = dados.documento;

      document.getElementById("nome").value = dados.nome;
      document.getElementById("email").value = dados.email;
      document.getElementById("cpf-cnpj").value = dados.documento;

      atualizarIniciais(dados.nome);
    })
    .catch(err => console.error("Erro ao carregar dados:", err));

  document.querySelectorAll(".btn-editar-campo").forEach(btn => {
    btn.addEventListener("click", () => {
      const campo = btn.getAttribute("data-campo");
      document.getElementById(campo).style.display = "block";
      btn.style.display = "none";
      document.getElementById("botoes-acoes").style.display = "flex";
    });
  });

  document.getElementById("cancel-btn").addEventListener("click", () => {
    location.reload();
  });

  document.getElementById("profile-form").addEventListener("submit", e => {
    e.preventDefault();
    const formData = new FormData(e.target);

    fetch("/Projeto-Planner/Project/php/salvar_perfil_anunciante.php", {
      method: "POST",
      body: formData,
    })
      .then(res => res.json())
      .then(data => {
        if (data.erro) {
          mostrarNotificacao(data.erro, true); // Exibe erro em vermelho
        } else if (data.sucesso) {
          mostrarNotificacao(data.sucesso, false); // Exibe sucesso em verde
          setTimeout(() => location.reload(), 1500);
        } else {
          mostrarNotificacao("Resposta inesperada do servidor.", true);
        }
      })
      .catch(err => {
        console.error("Erro ao salvar:", err);
        mostrarNotificacao("Erro ao salvar: " + err, true);
      });
  });
});
