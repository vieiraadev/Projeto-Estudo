document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById('form-anuncio');

    if (form) {
        form.addEventListener('submit', function (e) {
            e.preventDefault();

            const formData = new FormData(form);

            fetch('/Projeto-Planner/Project/php/anunciante.php', {
                method: 'POST',
                body: formData
            })
            .then(res => res.json())
            .then(dados => {
                if (dados.sucesso) {
                    alert("" + dados.mensagem);
                    form.reset();
                } else {
                    alert("Erro: " + dados.erro);
                }
            })
            .catch(erro => {
                console.error("Erro:", erro);
                alert("Erro inesperado ao enviar o anúncio.");
            });
        });
    }
});
