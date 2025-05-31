document.getElementById("chatForm").addEventListener("submit", function (e) {
    e.preventDefault();

    const input = document.getElementById("userInput");
    const userText = input.value.trim();
    if (!userText) return;

    const chatBox = document.getElementById("chatBox");

    const userMessage = document.createElement("div");
    userMessage.classList.add("message", "user-message");
    userMessage.textContent = userText;
    chatBox.appendChild(userMessage);

    const loadingMessage = document.createElement("div");
    loadingMessage.classList.add("message", "bot-message");
    loadingMessage.textContent = "Pensando...";
    chatBox.appendChild(loadingMessage);
    chatBox.scrollTop = chatBox.scrollHeight;

    input.value = "";

    fetch("/Projeto-Planner/Project/php/resposta.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ mensagem: userText })
    })
    .then(response => response.text())
    .then(text => {
        console.log("🔍 Resposta bruta da IA:", text);

        let data;
        try {
            data = JSON.parse(text);
        } catch (e) {
            throw new Error("Resposta não é JSON válida");
        }

        loadingMessage.remove();

        const botMessage = document.createElement("div");
        botMessage.classList.add("message", "bot-message");

        let conteudo = data.resposta;

        // Tenta parsear várias vezes até dar certo ou falhar
        for (let i = 0; i < 3; i++) {
            try {
                if (typeof conteudo === "string") conteudo = JSON.parse(conteudo);
            } catch (e) {
                break; // se não puder mais parsear, sai do loop
            }
        }

        // Interpreta a resposta final
        if (typeof conteudo === "string") {
            botMessage.textContent = conteudo;
        } else if (Array.isArray(conteudo)) {
            botMessage.textContent = conteudo.join(" ");
        } else if (typeof conteudo === "object") {
            let respostaTexto = "";
            for (const key in conteudo) {
                if (!isNaN(key)) {
                    respostaTexto += conteudo[key] + " ";
                }
            }
            botMessage.textContent = respostaTexto.trim() || "❓ A IA não retornou resposta legível.";
        } else {
            botMessage.textContent = "❌ Estrutura de resposta desconhecida.";
        }

        chatBox.appendChild(botMessage);
        chatBox.scrollTop = chatBox.scrollHeight;
    })
    .catch(err => {
        loadingMessage.remove();
        const error = document.createElement("div");
        error.classList.add("message", "bot-message");
        error.textContent = "❌ Erro na requisição: " + err.message;
        chatBox.appendChild(error);
    });
});
