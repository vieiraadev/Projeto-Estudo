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

document.addEventListener("DOMContentLoaded", function () {
    const imagemInput = document.getElementById('imagem_anuncio');
    const previewContainer = document.getElementById('previewContainer');

    if (imagemInput) {
        imagemInput.addEventListener('change', function () {
            previewContainer.innerHTML = ''; // limpa anterior

            const file = imagemInput.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function (e) {
                    // Criar contêiner da imagem com botão
                    const wrapper = document.createElement('div');
                    wrapper.style.position = 'relative';
                    wrapper.style.display = 'inline-block';
                    
                    const img = document.createElement('img');
                    img.src = e.target.result;
                    img.style.width = '100px';
                    img.style.height = '100px';
                    img.style.objectFit = 'cover';
                    img.style.border = '1px solid #ccc';
                    img.style.borderRadius = '8px';

                    // Criar botão de remover (bolinha com X)
                    const closeBtn = document.createElement('span');
                    closeBtn.innerHTML = '&times;';
                    closeBtn.style.position = 'absolute';
                    closeBtn.style.top = '-6px';
                    closeBtn.style.right = '-6px';
                    closeBtn.style.width = '20px';
                    closeBtn.style.lineHeight = '20px'; // centraliza verticalmente
                    closeBtn.style.height = '20px';
                    closeBtn.style.borderRadius = '50%';
                    closeBtn.style.backgroundColor = '#ff4d4f';
                    closeBtn.style.color = 'white';
                    closeBtn.style.display = 'flex';
                    closeBtn.style.alignItems = 'center';
                    closeBtn.style.justifyContent = 'center';
                    closeBtn.style.cursor = 'pointer';
                    closeBtn.style.fontSize = '14px';
                    closeBtn.style.boxShadow = '0 0 4px rgba(0,0,0,0.2)';

                    // Função de remover a imagem e limpar o input
                    closeBtn.addEventListener('click', function () {
                        previewContainer.innerHTML = '';
                        imagemInput.value = '';
                    });

                    wrapper.appendChild(img);
                    wrapper.appendChild(closeBtn);
                    previewContainer.appendChild(wrapper);
                };
                reader.readAsDataURL(file);
            }
        });
    }
});