function selectEmail(index) {
    const emailItems = document.querySelectorAll('.email-item');
    emailItems.forEach(item => item.classList.remove('active-email'));
    emailItems[index].classList.add('active-email');

    const sender = emailItems[index].querySelector('.email-sender').textContent;
    const mensagemCompleta = emailItems[index].getAttribute('data-mensagem');
    const resposta = emailItems[index].getAttribute('data-resposta');

    document.querySelector('.email-title').textContent = "Dúvida do aluno";
    document.querySelector('.sender-avatar').textContent = sender.substring(0, 2).toUpperCase();
    document.querySelector('.email-meta div div:first-child').textContent = sender;
    document.querySelector('.email-body').innerHTML = `<p>${mensagemCompleta}</p>`;

    const replySection = document.querySelector('.reply-section');

    if (resposta && resposta.trim() !== '') {
        replySection.innerHTML = `<p style="color: green; padding: 2rem;">Mensagem já respondida</p>`;
    } else {
        replySection.innerHTML = `
            <h3>Responder dúvida</h3>
            <textarea id="resposta-texto" class="reply-input" placeholder="Digite sua resposta..."></textarea>
            <button class="send-button" onclick="enviarResposta()">Enviar Resposta</button>
        `;
    }
}

document.addEventListener("DOMContentLoaded", carregarDuvidas);

function carregarDuvidas() {
    fetch('/Projeto-Planner/Project/php/buscar_duvidas.php')
        .then(response => response.json())
        .then(data => {
            const emailList = document.querySelector('.email-list');
            emailList.innerHTML = ''; 

            if (data.length === 0) {
                emailList.innerHTML = "<p style='color: #6e7a8a; padding: 1rem;'>Nenhuma dúvida encontrada.</p>";
                return;
            }

            const naoRespondidas = data.filter(d => !d.resposta || d.resposta.trim() === '');
            const respondidas = data.filter(d => d.resposta && d.resposta.trim() !== '');
            const todas = [...naoRespondidas, ...respondidas];

            todas.forEach((duvida, index) => {
                const item = document.createElement('div');
                item.classList.add('email-item');
                item.setAttribute('onclick', `selectEmail(${index})`);
                item.setAttribute('data-mensagem', duvida.mensagem);
                item.setAttribute('data-resposta', duvida.resposta || '');
                item.setAttribute('data-id-suporte', duvida.id); 

                if (duvida.resposta && duvida.resposta.trim() !== '') {
                    item.classList.add('respondido');
                }

                item.innerHTML = `
                    <div class="email-header">
                        <div class="email-sender">${duvida.nome}</div>
                        <div class="email-time">${formatarData(duvida.data_envio)}</div>
                    </div>
                    <div class="email-subject">Dúvida enviada</div>
                    <div class="email-preview">${duvida.mensagem.substring(0, 60)}...</div>
                `;
                emailList.appendChild(item);
            });
        })
        .catch(error => {
            console.error("Erro ao carregar dúvidas:", error);
            Swal.fire("Erro!", "Falha ao carregar dúvidas.", "error");
        });
}

function enviarResposta() {
    const resposta = document.getElementById('resposta-texto').value.trim();
    const emailAtivo = document.querySelector('.email-item.active-email');

    if (!resposta) {
        Swal.fire("Aviso", "Digite uma resposta antes de enviar.", "warning");
        return;
    }

    if (!emailAtivo) {
        Swal.fire("Aviso", "Selecione uma dúvida para responder.", "warning");
        return;
    }

    const idSuporte = emailAtivo.getAttribute('data-id-suporte');

    fetch('/Projeto-Planner/Project/php/responder_duvida.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `id_suporte=${encodeURIComponent(idSuporte)}&resposta=${encodeURIComponent(resposta)}`
    })
    .then(response => response.json())
    .then(data => {
        Swal.fire({
            icon: data.status === 'sucesso' ? 'success' : 'error',
            title: data.status === 'sucesso' ? 'Sucesso' : 'Erro',
            text: data.mensagem
        });

        if (data.status === 'sucesso') {
            document.getElementById('resposta-texto').value = '';
            carregarDuvidas();
        }
    })
    .catch(error => {
        console.error('Erro ao enviar resposta:', error);
        Swal.fire("Erro!", "Erro ao enviar resposta.", "error");
    });
}

function formatarData(dataString) {
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR') + ' ' + data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}
