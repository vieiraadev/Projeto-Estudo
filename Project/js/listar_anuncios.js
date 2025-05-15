document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('editModal');
    const closeModalBtn = document.getElementById('closeModal');
    const editForm = document.getElementById('editForm');

    function abrirModalEditar(anuncio) {
        const inputId = document.getElementById('edit-id');
    console.log('edit-id element:', inputId);
    if (!inputId) {
        alert('Erro: elemento edit-id não encontrado no DOM.');
        return;
    }
    modal.style.display = 'block';
    inputId.value = anuncio.id_anuncio;
        modal.style.display = 'block';
        document.getElementById('edit-id').value = anuncio.id_anuncio;
        document.getElementById('edit-titulo').value = anuncio.titulo || '';
        document.getElementById('edit-site').value = anuncio.site_empresa || '';
        document.getElementById('edit-categoria').value = anuncio.categoria || '';
        document.getElementById('edit-duracao').value = anuncio.duracao || '';
        document.getElementById('edit-situacao').value = anuncio.situacao || '';
    }

    closeModalBtn.onclick = function() {
        modal.style.display = 'none';
    };

    window.onclick = function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    };

    editForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const formData = new URLSearchParams(new FormData(editForm)).toString();

        fetch('/Projeto-Planner/Project/php/editar_anuncio.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Anúncio atualizado com sucesso.');
                modal.style.display = 'none';
                carregarAnuncios();
            } else {
                alert('Erro ao atualizar: ' + data.error);
            }
        })
        .catch(() => alert('Erro na requisição ao atualizar.'));
    });

    // Função carregarAnuncios pode ficar dentro ou fora, mas precisa acessar abrirModalEditar
    function carregarAnuncios() {
        fetch('/Projeto-Planner/Project/php/listar_anuncios.php')
            .then(response => response.json())
            .then(data => {
                const adCardsContainer = document.getElementById('ad-cards');
                adCardsContainer.innerHTML = '';

                if (data.length > 0) {
                    data.forEach(anuncio => {
                        const adCard = document.createElement('div');
                        adCard.classList.add('ad-card');
                        
                        adCard.innerHTML = `
                            <div class="ad-image">
                                <img src="${anuncio.imagem_anuncio}" alt="Imagem do Anúncio">
                            </div>
                            <div class="ad-details">
                                <h3 class="ad-title">${anuncio.titulo}</h3>
                                <p class="ad-info"><i class='bx bx-link'></i> Site da empresa: ${anuncio.site_empresa}</p>
                                <p class="ad-info"><i class='bx bx-tag'></i> Categoria: ${anuncio.categoria}</p>
                                <p class="ad-info"><i class='bx bx-time'></i> Duração: ${anuncio.duracao} dias</p>
                                <div class="ad-actions">
                                    <a href="#" class="btn btn-edit" data-id="${anuncio.id_anuncio}">Editar</a>
                                    <a href="#" class="btn btn-delete" data-id="${anuncio.id_anuncio}">Excluir</a>
                                </div>
                            </div>
                        `;

                        adCardsContainer.appendChild(adCard);

                        adCard.querySelector('.btn-delete').addEventListener('click', (e) => {
                            e.preventDefault();
                            const anuncioId = e.currentTarget.dataset.id;
                            if (confirm('Tem certeza que deseja excluir este anúncio?')) {
                                fetch('/Projeto-Planner/Project/php/excluir_anuncio.php', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                                    body: new URLSearchParams({ id_anuncio: anuncioId }).toString()
                                })
                                .then(response => response.json())
                                .then(data => {
                                    if (data.success) {
                                        alert('Anúncio excluído com sucesso.');
                                        carregarAnuncios();
                                    } else {
                                        alert('Erro ao excluir: ' + data.error);
                                    }
                                })
                                .catch(() => alert('Erro na requisição ao excluir.'));
                            }
                        });

                        adCard.querySelector('.btn-edit').addEventListener('click', (e) => {
                            e.preventDefault();
                            abrirModalEditar(anuncio);
                        });
                    });
                } else {
                    adCardsContainer.innerHTML = '<p>Nenhum anúncio encontrado.</p>';
                }
            })
            .catch(() => {
                const adCardsContainer = document.getElementById('ad-cards');
                adCardsContainer.innerHTML = '<p>Erro ao carregar os anúncios.</p>';
            });
    }

    carregarAnuncios();
});
