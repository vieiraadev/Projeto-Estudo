document.addEventListener('DOMContentLoaded', function () {
  // Lógica do formulário de login
  const loginForm = document.getElementById('loginForm'); // Certifique-se de que o id do formulário está correto
  if (loginForm) {
    loginForm.addEventListener('submit', function (e) {
      e.preventDefault();  // Previne o envio padrão do formulário

      const formData = new FormData(loginForm);

      fetch('/Projeto-Planner/Project/php/login.php', {
        method: 'POST',
        body: formData,
      })
        .then(response => response.json())  // Espera resposta em JSON
        .then(data => {
          if (data.sucesso) {
            // Se o login for bem-sucedido, redireciona para a home
            window.location.href = '/Projeto-Planner/Project/html/home.html';
          } else if (data.erro) {
            alert(data.erro); // Exibe o alerta "Email e/ou senha incorretos."
          } else {
            alert('Erro inesperado.');
          }
        })
        .catch(error => {
          console.error('Erro:', error);
          alert('Erro ao tentar logar.');
        });
    });
  }
});
