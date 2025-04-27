document.addEventListener('DOMContentLoaded', function () {
  // Lógica do formulário de login
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', function (e) {
      e.preventDefault();

      const formData = new FormData(loginForm);

      fetch('/Projeto-Planner/Project/php/login.php', {
        method: 'POST',
        body: formData,
      })
        .then(response => response.json())
        .then(data => {
          if (data.sucesso) {
            window.location.href = '/Projeto-Planner/Project/html/home.html';
          } else if (data.erro) {
            alert(data.erro);
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
