document.addEventListener('DOMContentLoaded', function() {
    // Elementos do DOM
    const chatBox = document.getElementById('chatBox');
    const userInput = document.getElementById('userInput');
    const sendButton = document.getElementById('sendButton');
    const chatForm = document.getElementById('chatForm');
    
    // Configurações
    const API_URL = '/Projeto-Planner/Project/php/chatgpt.php';
    const SYSTEM_PROMPT = `Você é um assistente de estudos especializado...`;
    
    let isProcessing = false;

    chatForm.addEventListener('submit', handleFormSubmit);
    userInput.addEventListener('keydown', handleKeyDown);

    async function handleFormSubmit(e) {
        e.preventDefault();
        await processMessage();
    }

    function handleKeyDown(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            processMessage();
        }
    }

    async function processMessage() {
        if (isProcessing) return;
        
        const message = userInput.value.trim();
        if (!message) return;

        isProcessing = true;
        disableInput();
        addMessage('user', message);
        userInput.value = '';
        
        const typingIndicator = addTypingIndicator();
        
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ 
                    message: message,
                    context: SYSTEM_PROMPT
                }),
                credentials: 'same-origin'
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `Erro HTTP: ${response.status}`);
            }

            const data = await response.json();
            chatBox.removeChild(typingIndicator);
            
            if (data.reply) {
                addMessage('bot', data.reply);
            } else {
                throw new Error('Resposta inválida da API');
            }
            
        } catch (error) {
            console.error('Erro no chat:', error);
            chatBox.removeChild(typingIndicator);
            showError(error.message);
        } finally {
            isProcessing = false;
            enableInput();
            userInput.focus();
        }
    }

    function addMessage(sender, text) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        messageDiv.textContent = text;
        
        messageDiv.style.opacity = '0';
        messageDiv.style.transform = 'translateY(10px)';
        messageDiv.style.transition = 'all 0.3s ease';
        
        chatBox.appendChild(messageDiv);
        
        setTimeout(() => {
            messageDiv.style.opacity = '1';
            messageDiv.style.transform = 'translateY(0)';
        }, 10);
        
        scrollToBottom();
    }

    function addTypingIndicator() {
        const indicator = document.createElement('div');
        indicator.className = 'message bot-message typing-indicator';
        indicator.innerHTML = '<span class="typing-dots"><span>.</span><span>.</span><span>.</span></span>';
        chatBox.appendChild(indicator);
        scrollToBottom();
        return indicator;
    }

    function showError(errorDetail) {
        const errorMessages = [
            "Estamos com dificuldades técnicas. Por favor, tente novamente mais tarde.",
            "Ops! Algo deu errado. Por favor, tente novamente.",
            `Desculpe, ocorreu um erro: ${errorDetail || 'Erro desconhecido'}`
        ];
        addMessage('bot', errorMessages[Math.floor(Math.random() * errorMessages.length)]);
    }

    function disableInput() {
        userInput.disabled = true;
        sendButton.disabled = true;
        sendButton.classList.add('disabled');
    }

    function enableInput() {
        userInput.disabled = false;
        sendButton.disabled = false;
        sendButton.classList.remove('disabled');
    }

    function scrollToBottom() {
        chatBox.scrollTop = chatBox.scrollHeight;
    }
});