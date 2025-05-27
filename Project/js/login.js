document.addEventListener('DOMContentLoaded', function () {
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
            Swal.fire({
              icon: 'success',
              title: 'Login realizado com sucesso!',
              showConfirmButton: false,
              timer: 1500
            }).then(() => {
              window.location.href = '/Projeto-Planner/Project/html/home.html';
            });
          } else if (data.erro) {
            Swal.fire({
              icon: 'error',
              title: 'Erro no login',
              text: data.erro
            });
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Erro inesperado',
              text: 'Tente novamente mais tarde.'
            });
          }
        })
        .catch(error => {
          console.error('Erro:', error);
          Swal.fire({
            icon: 'error',
            title: 'Erro de conexão',
            text: 'Erro ao tentar logar. Verifique sua conexão.'
          });
        });
    });
  }
});
