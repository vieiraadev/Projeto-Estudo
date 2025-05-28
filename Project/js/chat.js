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
    .then(response => response.json())
    .then(data => {
        loadingMessage.remove();
    
        const botMessage = document.createElement("div");
        botMessage.classList.add("message", "bot-message");
    
        if (Array.isArray(data) && data[0]?.generated_text) {
            botMessage.textContent = data[0].generated_text;
        } else if (data.erro) {
            botMessage.textContent = "Erro da IA: " + data.erro;
        } else {
            botMessage.textContent = "Resposta inválida da IA.";
        }
    
        chatBox.appendChild(botMessage);
        chatBox.scrollTop = chatBox.scrollHeight;
    })
    .catch(err => {
        loadingMessage.remove();
        const error = document.createElement("div");
        error.classList.add("message", "bot-message");
        error.textContent = "Erro ao tentar conversar com a IA: " + err;
        chatBox.appendChild(error);
    });
    
});
