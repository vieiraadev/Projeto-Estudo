const form = document.getElementById('loginForm');
const password = document.getElementById('password');
const confirmPassword = document.getElementById('confirm-password');

form.addEventListener('submit', function (e) {
  if (password.value !== confirmPassword.value) {
    e.preventDefault();
    alert('As senhas não coincidem. Por favor, verifique.');
    return false;
  }
});
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
  