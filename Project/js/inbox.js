document.addEventListener("DOMContentLoaded", () => {
    fetch('/Projeto-Planner/Project/php/buscar_respostas_usuario.php')
        .then(res => res.json())
        .then(data => renderEmails(data))
        .catch(err => console.error("Erro ao buscar mensagens:", err));
});

function renderEmails(lista) {
    const emailList = document.querySelector('.email-list');
    emailList.innerHTML = ''; 

    if (!lista || !lista.length) {
        const noMessages = document.createElement('div');
        noMessages.className = "no-messages";
        noMessages.innerHTML = "<p>Nenhuma resposta recebida.</p>";
        emailList.appendChild(noMessages);
        return;
    }

    lista.forEach(item => {
        const div = document.createElement('div');
        div.className = "email-item respondido";
        div.onclick = () => selectEmail(item);
        
        div.innerHTML = `
            <div class="email-header">
                <div class="email-sender">Suporte</div>
                <div class="email-time">${formatarData(item.data_envio)}</div>
            </div>
            <div class="email-subject">Resposta recebida</div>
            <div class="email-preview">${item.resposta.substring(0, 60)}...</div>
        `;
        emailList.appendChild(div);
    });

    if (lista.length > 0) {
        selectEmail(lista[0]);
    }
}

function selectEmail(item) {
    document.querySelector('.email-title').textContent = "Dúvida respondida";
    document.querySelector('.sender-avatar').textContent = "S";
    document.querySelector('.sender-info').textContent = "Estudo+ Suporte";
    document.querySelector('.email-time').textContent = formatarData(item.data_envio);

    document.querySelector('.email-body').innerHTML = `
        <p><strong>Enviado em:</strong> ${formatarData(item.data_envio)}</p>
        <div class="user-question">
            <strong>Sua dúvida:</strong>
            <p>${item.mensagem}</p>
        </div>
    `;

    const replySection = document.querySelector('.reply-section');
    replySection.innerHTML = `
        <h3>Resposta do Suporte</h3>
        <div class="resposta-suporte">
            <p>${item.resposta}</p>
        </div>
    `;
    replySection.style.display = "block";


    document.querySelectorAll('.email-item').forEach(el => {
        el.classList.remove('active-email');
    });
    event.currentTarget.classList.add('active-email');
}

function formatarData(dataString) {
    const d = new Date(dataString);
    return d.toLocaleDateString('pt-BR') + " " + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}