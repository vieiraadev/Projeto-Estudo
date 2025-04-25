document.addEventListener('DOMContentLoaded', function () {
    const forgotPasswordModal = document.getElementById('forgotPasswordModal');
    const resetPasswordModal = document.getElementById('resetPasswordModal');
    const cancelBtn = document.getElementById('cancelBtn');
    const sendBtn = document.getElementById('sendBtn');
    const cancelResetBtn = document.getElementById('cancelResetBtn');
  
    function closeModal(modal) {
      modal.classList.add('hidden');
      modal.classList.remove('show');
    }
  
    function openModal(modal) {
      modal.classList.remove('hidden');
      modal.classList.add('show');
    }
  
    function sendResetEmail() {
      const email = document.getElementById('reset-email').value;
      if (email) {
        alert(`Instruções de recuperação enviadas para: ${email}`);
        closeModal(forgotPasswordModal);
        openModal(resetPasswordModal);
      } else {
        alert('Por favor, insira um email válido.');
      }
    }
  
    cancelBtn.addEventListener('click', () => closeModal(forgotPasswordModal));
    cancelResetBtn.addEventListener('click', () => closeModal(resetPasswordModal));
    sendBtn.addEventListener('click', sendResetEmail);
  
    forgotPasswordModal.addEventListener('click', function (event) {
      if (event.target === forgotPasswordModal) {
        closeModal(forgotPasswordModal);
      }
    });
  
    resetPasswordModal.addEventListener('click', function (event) {
      if (event.target === resetPasswordModal) {
        closeModal(resetPasswordModal);
      }
    });
  
    document.querySelector('.forgot-password a').addEventListener('click', function (e) {
      e.preventDefault();
      openModal(forgotPasswordModal);
    });
  });
  