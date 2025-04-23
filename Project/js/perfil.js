function atualizarIniciais(nomeCompleto) {
    const partes = nomeCompleto.trim().split(" ").filter(Boolean);
    let iniciais = "";
  
    if (partes.length >= 2) {
      const primeiraInicial = partes[0].charAt(0).toUpperCase();
      const segundaInicial = partes.find((parte, index) => index > 0 && parte.length > 0)?.charAt(0).toUpperCase() || "";
      iniciais = primeiraInicial + segundaInicial;
    } else if (partes.length === 1) {
      iniciais = partes[0].charAt(0).toUpperCase();
    }
  
    const fotoTopo = document.getElementById("profile-initials");
    const fotoSidebar = document.getElementById("profile-initials-sidebar");
  
    if (fotoTopo) fotoTopo.textContent = iniciais;
    if (fotoSidebar) fotoSidebar.textContent = iniciais;
  }
  
  function mostrarNotificacao(mensagem, erro = false) {
    const notif = document.getElementById("notification");
    notif.textContent = mensagem;
    notif.style.backgroundColor = erro ? "#e74c3c" : "#2ecc71";
    notif.classList.add("show");
    setTimeout(() => notif.classList.remove("show"), 2500);
  }
  
  document.addEventListener("DOMContentLoaded", () => {
    fetch("/Projeto-Planner/Project/php/buscardados_perfil.php")
      .then(res => res.json())
      .then(dados => {
        if (dados.erro) {
          console.error(dados.erro);
          return;
        }
  
        document.getElementById("nome-atual").textContent = dados.nome;
        document.getElementById("email-atual").textContent = dados.email;
        document.getElementById("nome").value = dados.nome;
        document.getElementById("email").value = dados.email;
  
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
  
      fetch("/Projeto-Planner/Project/php/salvar_perfil.php", {
        method: "POST",
        body: formData,
      })
        .then(res => res.text())
        .then(msg => {
          mostrarNotificacao(msg);
          setTimeout(() => location.reload(), 1500);
        })
        .catch(err => mostrarNotificacao("Erro ao salvar: " + err, true));
    });
  });
  