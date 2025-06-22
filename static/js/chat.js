document.addEventListener('DOMContentLoaded', () => {
    const messageInput = document.getElementById('message-input');
    const sendButton = document.getElementById('send-button');
    const chatMessages = document.getElementById('chat-messages');
    let isProcessing = false;
    let messageHistory = [];

    // Function to add a message to the chat
    function addMessage(message, isUser = false) {
        const messageDiv = document.createElement('div');
        // Detect error message
        const isError = typeof message === 'string' && (message.startsWith('Error:') || message.startsWith('Sorry, I encountered an error') || message.startsWith('[BioGPT model not loaded]') || message.startsWith('[Error generating response'));
        messageDiv.className = `message ${isUser ? 'user' : 'bot'}${isError ? ' error' : ''}`;
        messageDiv.innerHTML = `
            <div class="message-content${isError ? ' error-message' : ''}">
                <p>${message}</p>
            </div>
        `;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Function to add typing indicator
    function addTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message bot';
        typingDiv.id = 'typing-indicator';
        typingDiv.innerHTML = `
            <div class="message-content">
                <div class="typing-dots">
                    <span class="dot"></span>
                    <span class="dot"></span>
                    <span class="dot"></span>
                </div>
            </div>
        `;
        chatMessages.appendChild(typingDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Function to remove typing indicator
    function removeTypingIndicator() {
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    // Function to send message to backend
    async function sendMessage(message) {
        try {
            const response = await fetch('/api/chatbot/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: message,
                    context_report_id: null, // Can be updated later if report context is needed
                    history: messageHistory.length > 0 ? messageHistory.slice(-5) : null // Send last 5 user messages
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                return `Error: ${errorText}`;
            }

            const data = await response.json();
            return data.message;
        } catch (error) {
            console.error('Error:', error);
            return 'Sorry, I encountered an error. Please try again.';
        }
    }

    // Handle send button click
    async function handleSend() {
        const message = messageInput.value.trim();
        if (message && !isProcessing) {
            isProcessing = true;
            messageInput.value = '';
            
            // Add user message
            addMessage(message, true);
            messageHistory.push(message); // Add to history
            
            // Show typing indicator
            addTypingIndicator();
            
            // Get bot response
            const response = await sendMessage(message);
            
            // Remove typing indicator and add bot response
            removeTypingIndicator();
            addMessage(response);
            
            isProcessing = false;
        }
    }

    // Event listeners
    sendButton.addEventListener('click', handleSend);
    
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    });

    // Focus input on page load
    messageInput.focus();
});