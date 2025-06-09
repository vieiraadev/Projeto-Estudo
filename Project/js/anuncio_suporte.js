document.addEventListener('DOMContentLoaded', () => {
  const container = document.querySelector('.ad-cards');
  const inputBusca = document.querySelector('.search-input');
  let anunciosOriginais = [];
  let anuncioIdParaRecusar = null;

  // Buscar anúncios
  fetch('/Projeto-Planner/Project/php/anuncios_suporte.php')
    .then(response => response.json())
    .then(data => {
      if (Array.isArray(data)) {
        anunciosOriginais = data;
        renderizarAnuncios(anunciosOriginais);
      } else {
        container.innerHTML = "<p>Erro ao carregar anúncios.</p>";
      }
    })
    .catch(error => {
      console.error('Erro ao carregar anúncios:', error);
      container.innerHTML = "<p>Erro ao carregar anúncios.</p>";
    });

  // Renderizar cards
  function renderizarAnuncios(lista) {
    container.innerHTML = '';

    lista.forEach(anuncio => {
      const card = document.createElement('div');
      card.classList.add('ad-card');

      card.innerHTML = `
        <div class="ad-image">
            <img src="${anuncio.imagem}" alt="${anuncio.titulo} Logo">
        </div>
        <div class="ad-details">
            <h3 class="ad-title">${anuncio.titulo}</h3>
            <p class="ad-info"><i class='bx bx-link'></i> ${anuncio.site_empresa}</p>
            <p class="ad-info"><i class='bx bx-tag'></i> Categoria: ${anuncio.categoria}</p>
            <p class="ad-info"><i class='bx bx-time'></i> Duração: ${anuncio.duracao} dias</p>
            <div class="ad-actions">
                <a href="#" class="btn btn-edit btn-aprovar" data-id="${anuncio.id_anuncio}">Aprovar</a>
                <button class="btn btn-delete" data-id="${anuncio.id_anuncio}">Recusar</button>
            </div>
        </div>
      `;

      container.appendChild(card);
    });

    aplicarEventos();
  }

  // Filtro da barra de pesquisa
  inputBusca.addEventListener('keyup', (e) => {
    const termo = e.target.value.toLowerCase();
    const filtrados = anunciosOriginais.filter(anuncio =>
      anuncio.titulo.toLowerCase().includes(termo) ||
      anuncio.categoria.toLowerCase().includes(termo) ||
      anuncio.site_empresa.toLowerCase().includes(termo)
    );
    renderizarAnuncios(filtrados);
  });

  // Eventos Aprovar/Recusar
  function aplicarEventos() {
    document.querySelectorAll('.btn-aprovar').forEach(botao => {
      botao.addEventListener('click', async (e) => {
        e.preventDefault();

        const confirmacao = await Swal.fire({
          title: 'Confirmar aprovação?',
          text: "Tem certeza que deseja aprovar este anúncio?",
          icon: 'question',
          showCancelButton: true,
          confirmButtonText: 'Sim, aprovar!',
          cancelButtonText: 'Cancelar'
        });

        if (!confirmacao.isConfirmed) return;

        const id = botao.getAttribute('data-id');

        fetch('/Projeto-Planner/Project/php/aprovar_anuncio.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id_anuncio: parseInt(id) })
        })
        .then(res => res.json())
        .then(response => {
          Swal.fire({
            icon: response.sucesso ? 'success' : 'error',
            title: response.sucesso ? 'Aprovado!' : 'Erro!',
            text: response.sucesso ? 'Anúncio aprovado com sucesso!' : 'Erro ao aprovar anúncio.'
          });

          if (response.sucesso) {
            botao.closest('.ad-card').remove();
          }
        })
        .catch(() => {
          Swal.fire('Erro', 'Erro na requisição.', 'error');
        });
      });
    });

    document.querySelectorAll('.btn-delete').forEach(botao => {
      botao.addEventListener('click', (e) => {
        e.preventDefault();
        anuncioIdParaRecusar = botao.getAttribute('data-id');
        document.getElementById('comentario-recusa').value = '';
        document.getElementById('modal-recusar').classList.remove('hidden');
      });
    });

    document.getElementById('cancelar-recusa').addEventListener('click', () => {
      document.getElementById('modal-recusar').classList.add('hidden');
      anuncioIdParaRecusar = null;
    });

    document.getElementById('confirmar-recusa').addEventListener('click', () => {
      const comentario = document.getElementById('comentario-recusa').value.trim();

      if (!comentario) {
        Swal.fire('Atenção', 'Por favor, digite um comentário.', 'warning');
        return;
      }

      fetch('/Projeto-Planner/Project/php/recusar_anuncio.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_anuncio: parseInt(anuncioIdParaRecusar),
          comentario: comentario
        })
      })
      .then(res => res.json())
      .then(response => {
        Swal.fire({
          icon: response.sucesso ? 'success' : 'error',
          title: response.sucesso ? 'Recusado!' : 'Erro!',
          text: response.sucesso ? 'Anúncio recusado com sucesso!' : 'Erro ao recusar anúncio.'
        });

        if (response.sucesso) {
          document.querySelector(`.btn-aprovar[data-id="${anuncioIdParaRecusar}"]`)
            .closest('.ad-card').remove();
        }
      })
      .catch(() => {
        Swal.fire('Erro', 'Erro na requisição.', 'error');
      })
      .finally(() => {
        document.getElementById('modal-recusar').classList.add('hidden');
        anuncioIdParaRecusar = null;
      });
    });
  }
});
