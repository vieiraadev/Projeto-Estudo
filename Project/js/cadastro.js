const form = document.getElementById('loginForm');
const password = document.getElementById('password');
const confirmPassword = document.getElementById('confirm-password');

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('formCadastro');
  const password = document.getElementById('password');
  const confirmPassword = document.getElementById('confirm-password');

  form.addEventListener('submit', function (event) {
      event.preventDefault(); // Impede envio normal

      if (password.value !== confirmPassword.value) {
          alert('As senhas não coincidem. Por favor, verifique.');
          return;
      }

      const formData = new FormData(form);

      fetch('/Projeto-Planner/Project/php/cadastro.php', { 
          method: 'POST',
          body: formData
      })
      .then(response => response.json())
      .then(data => {
          if (data.erro) {
              alert("Erro: " + data.erro);
          } else if (data.sucesso) {
              alert(data.sucesso);
              window.location.href = '/Projeto-Planner/Project/html/login.html';
          }
      })
      .catch(error => {
          console.error('Erro na requisição:', error);
          alert('Erro de conexão. Tente novamente.');
      });
  });

  // Botões de mostrar/esconder senha
  document.querySelectorAll('.password-toggle').forEach(button => {
      button.addEventListener('click', () => {
          const targetId = button.getAttribute('data-target');
          const input = document.getElementById(targetId);
          const icon = button.querySelector('i');

          if (input.type === 'password') {
              input.type = 'text';
              icon.classList.remove('bx-show');
              icon.classList.add('bx-hide');
          } else {
              input.type = 'password';
              icon.classList.remove('bx-hide');
              icon.classList.add('bx-show');
          }
      });
  });
});
