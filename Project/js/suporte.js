document.getElementById('duvidaForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const form = this; // <-- salva a referência correta do formulário
    const formData = new FormData(form);

    fetch('/Projeto-Planner/Project/php/suporte.php', {
        method: 'POST',
        body: formData
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Erro na requisição com o servidor.');
        }
        return response.json();
    })
    .then(data => {
        Swal.fire({
            title: data.success ? 'Sucesso!' : 'Erro!',
            text: data.message,
            icon: data.success ? 'success' : 'error',
            confirmButtonText: 'OK'
        });

        if (data.success) {
            form.reset(); // <-- agora sim, funciona corretamente
        }
    })
    .catch(error => {
        console.error('Erro:', error);
        Swal.fire({
            title: 'Erro!',
            text: 'Erro ao enviar a dúvida. Tente novamente.',
            icon: 'error',
            confirmButtonText: 'OK'
        });
    });
});
