document.addEventListener('DOMContentLoaded', () => {
    const modalEditar = document.getElementById('editModal');
    const closeModalBtn = document.getElementById('closeModal');
    const editForm = document.getElementById('editForm');
    const comentarioModal = document.getElementById('comentarioModal');
    const closeComentarioModalBtn = document.getElementById('closeComentarioModal');

    function abrirModalEditar(anuncio) {
        modalEditar.style.display = 'block';
        document.getElementById('edit-id').value = anuncio.id_anuncio || '';
        document.getElementById('edit-titulo').value = anuncio.titulo || '';
        document.getElementById('edit-site').value = anuncio.site_empresa || '';
        document.getElementById('edit-categoria').value = anuncio.categoria || '';
        document.getElementById('edit-duracao').value = anuncio.duracao || '';
    }

    closeModalBtn.onclick = () => modalEditar.style.display = 'none';
    window.addEventListener('click', (event) => {
        if (event.target === modalEditar) modalEditar.style.display = 'none';
        if (event.target === comentarioModal) comentarioModal.style.display = 'none';
    });

    closeComentarioModalBtn.onclick = () => comentarioModal.style.display = 'none';

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
                Swal.fire('Sucesso!', 'Anúncio atualizado com sucesso.', 'success');
                modalEditar.style.display = 'none';
                carregarAnuncios();
            } else {
                Swal.fire('Erro!', data.error || 'Erro ao atualizar.', 'error');
            }
        })
        .catch(() => Swal.fire('Erro!', 'Erro na requisição ao atualizar.', 'error'));
    });

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

                    const botoes = [];
                    if (anuncio.situacao !== 'aprovado' && anuncio.situacao !== 'recusado') {
                        botoes.push(`<a href="#" class="btn btn-edit" data-id="${anuncio.id_anuncio}">Editar</a>`);
                    }
                    if (anuncio.situacao === 'recusado') {
                        botoes.push(`<a href="#" class="btn btn-comentario" data-comentario="${anuncio.comentario_recusa || 'Sem comentário disponível'}">Ver comentário</a>`);
                    }
                    botoes.push(`<a href="#" class="btn btn-delete" data-id="${anuncio.id_anuncio}">Excluir</a>`);

                    adCard.innerHTML = `
                        <div class="ad-image">
                            <img src="${anuncio.imagem_anuncio}" alt="Imagem do Anúncio">
                        </div>
                        <div class="ad-details">
                            <h3 class="ad-title">${anuncio.titulo}</h3>
                            <p class="ad-info"><i class='bx bx-link'></i> Site da empresa: ${anuncio.site_empresa}</p>
                            <p class="ad-info"><i class='bx bx-tag'></i> Categoria: ${anuncio.categoria}</p>
                            <p class="ad-info"><i class='bx bx-time'></i> Duração: ${anuncio.duracao} dias</p>
                            <p class="ad-info"><i class='bx-flag'></i> Situação: ${anuncio.situacao}</p>
                            <div class="ad-actions">${botoes.join('')}</div>
                        </div>
                    `;

                    adCardsContainer.appendChild(adCard);

                    const btnEdit = adCard.querySelector('.btn-edit');
                    if (btnEdit) {
                        btnEdit.addEventListener('click', (e) => {
                            e.preventDefault();
                            abrirModalEditar(anuncio);
                        });
                    }

                    const btnDelete = adCard.querySelector('.btn-delete');
                    btnDelete.addEventListener('click', (e) => {
                        e.preventDefault();
                        const anuncioId = e.currentTarget.dataset.id;
                        Swal.fire({
                            title: 'Tem certeza?',
                            text: "Essa ação não poderá ser desfeita!",
                            icon: 'warning',
                            showCancelButton: true,
                            confirmButtonText: 'Sim, excluir!',
                            cancelButtonText: 'Cancelar'
                        }).then((result) => {
                            if (result.isConfirmed) {
                                fetch('/Projeto-Planner/Project/php/excluir_anuncio.php', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                                    body: new URLSearchParams({ id_anuncio: anuncioId }).toString()
                                })
                                .then(response => response.json())
                                .then(data => {
                                    if (data.success) {
                                        Swal.fire('Excluído!', 'Anúncio removido com sucesso.', 'success');
                                        carregarAnuncios();
                                    } else {
                                        Swal.fire('Erro!', data.error || 'Erro ao excluir.', 'error');
                                    }
                                })
                                .catch(() => Swal.fire('Erro!', 'Erro na requisição ao excluir.', 'error'));
                            }
                        });
                    });

                    const btnComentario = adCard.querySelector('.btn-comentario');
                    if (btnComentario) {
                        btnComentario.addEventListener('click', (e) => {
                            e.preventDefault();
                            const comentario = e.currentTarget.dataset.comentario;
                            document.getElementById('comentarioTexto').textContent = comentario;
                            comentarioModal.style.display = 'block';
                        });
                    }
                });
            } else {
                adCardsContainer.innerHTML = '<p>Nenhum anúncio encontrado.</p>';
            }
        })
        .catch(() => {
            document.getElementById('ad-cards').innerHTML = '<p>Erro ao carregar os anúncios.</p>';
        });
    }

    carregarAnuncios();
});
