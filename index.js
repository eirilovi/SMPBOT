document.addEventListener('DOMContentLoaded', function () {
  const sendButton = document.getElementById('send-btn');
  const messageInput = document.querySelector('.chat-input textarea');
  const chatBox = document.querySelector('.chatbox');

  sendButton.addEventListener('click', function() {
      const userMessage = messageInput.value.trim();
      if (userMessage) { // Check if the message is not empty
          // Display the user's message in the chatbox
          appendMessage(userMessage, 'outgoing');

          // Send the message to the server
          fetch('http://localhost:3000/ask', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify({ message: userMessage }),
          })
          .then(response => response.json())
          .then(data => {
              // Display the chatbot's response in the chatbox
              appendMessage(data.response, 'incoming');
          })
          .catch(error => {
              console.error('Error:', error);
              // Optionally handle the error by displaying a message to the user
              appendMessage('Sorry, there was an error processing your message.', 'incoming');
          });
      }

      // Clear the input area after sending
      messageInput.value = '';
  });

  function appendMessage(message, type) {
      // Create a new message element
      const messageElement = document.createElement('div');
      messageElement.classList.add('message', type);
      messageElement.innerText = message;

      // Append the message to the chatbox
      chatBox.appendChild(messageElement);

      // Scroll to the bottom of the chatbox
      chatBox.scrollTop = chatBox.scrollHeight;
  }
});
