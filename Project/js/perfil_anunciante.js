document.addEventListener("DOMContentLoaded", () => {
  const cpfCnpjInput = document.getElementById("cpf-cnpj");

  cpfCnpjInput.addEventListener("input", () => {
    cpfCnpjInput.value = cpfCnpjInput.value.replace(/\D/g, ''); 
  });
});

document.addEventListener("DOMContentLoaded", () => {
  fetch("/Projeto-Planner/Project/php/buscardados_anunciante.php")
    .then(res => res.json())
    .then(dados => {
      if (dados.erro) {
        console.error(dados.erro);
        Swal.fire({
          icon: 'error',
          title: 'Erro',
          text: dados.erro,
          confirmButtonColor: '#d33'
        });
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
    .catch(err => {
      console.error("Erro ao carregar dados:", err);
      Swal.fire({
        icon: 'error',
        title: 'Erro',
        text: 'Erro ao carregar dados: ' + err.message,
        confirmButtonColor: '#d33'
      });
    });

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
          Swal.fire({
            icon: 'error',
            title: 'Erro',
            text: data.erro,
            confirmButtonColor: '#d33'
          });
        } else if (data.sucesso) {
          Swal.fire({
            icon: 'success',
            title: 'Sucesso',
            text: data.sucesso,
            confirmButtonColor: '#28a745'
          }).then(() => {
            location.reload();
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Erro',
            text: 'Resposta inesperada do servidor.',
            confirmButtonColor: '#d33'
          });
        }
      })
      .catch(err => {
        console.error("Erro ao salvar:", err);
        Swal.fire({
          icon: 'error',
          title: 'Erro',
          text: 'Erro ao salvar: ' + err.message,
          confirmButtonColor: '#d33'
        });
      });
  });
});
