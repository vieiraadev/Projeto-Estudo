function selectEmail(index) {
    const emailItems = document.querySelectorAll('.email-item');
    emailItems.forEach(item => item.classList.remove('active-email'));
    emailItems[index].classList.add('active-email');

    const sender = emailItems[index].querySelector('.email-sender').textContent;
    const mensagemCompleta = emailItems[index].getAttribute('data-mensagem');

    document.querySelector('.email-title').textContent = "Dúvida do aluno";
    document.querySelector('.sender-avatar').textContent = sender.substring(0, 2).toUpperCase();
    document.querySelector('.email-meta div div:first-child').textContent = sender;
    document.querySelector('.email-body').innerHTML = `<p>${mensagemCompleta}</p>`;
}

const navLinks = document.querySelectorAll('aside nav a');
navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        navLinks.forEach(l => l.classList.remove('active'));
        this.classList.add('active');
    });
});

document.addEventListener("DOMContentLoaded", () => {
    fetch('/Projeto-Planner/Project/php/buscar_duvidas.php')
        .then(response => response.json())
        .then(data => {
            const emailList = document.querySelector('.email-list');
            emailList.innerHTML = ''; 

            if (data.length === 0) {
                emailList.innerHTML = "<p style='color: #6e7a8a; padding: 1rem;'>Nenhuma dúvida encontrada.</p>";
                return;
            }

            data.forEach((duvida, index) => {
                const item = document.createElement('div');
                item.classList.add('email-item');
                item.setAttribute('onclick', `selectEmail(${index})`);
                item.setAttribute('data-mensagem', duvida.mensagem);
                item.setAttribute('data-id-suporte', duvida.id); 

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
        });
});

function formatarData(dataString) {
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR') + ' ' + data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function enviarResposta() {
    const resposta = document.getElementById('resposta-texto').value.trim();
    const emailAtivo = document.querySelector('.email-item.active-email');

    if (!resposta) {
        alert("Digite uma resposta antes de enviar.");
        return;
    }

    if (!emailAtivo) {
        alert("Selecione uma dúvida para responder.");
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
        alert(data.mensagem);
        if (data.status === 'sucesso') {
            document.getElementById('resposta-texto').value = '';
        }
    })
    .catch(error => {
        console.error('Erro ao enviar resposta:', error);
        alert("Erro ao enviar resposta.");
    });
}
