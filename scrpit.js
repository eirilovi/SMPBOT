document.addEventListener('DOMContentLoaded', function () {
  const chatInput = document.querySelector(".chat-input textarea");
  const sendChatBtn = document.querySelector(".chat-input span");
  const chatbox = document.querySelector(".chatbox");

  const createChatLi = (message, className) => {
    const chatLi = document.createElement("li");
    chatLi.classList.add("chat", className);
    let chatContent = className === "outgoing" ? `<p>${message}</p>` : `<span class="material-symbols-outlined">smart_toy</span><p>${message}</p>`;
    chatLi.innerHTML = chatContent;
    return chatLi;
  }

  // Function to generate and handle response from the server
  const generateResponse = (userMessage) => {
    fetch('http://localhost:3000/ask', { // Make sure the URL matches your server's URL
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message: userMessage }),
    })
    .then(response => response.json())
    .then(data => {
        chatbox.appendChild(createChatLi(data.response, "incoming"));
    })
    .catch(error => {
        console.error('Error:', error);
        chatbox.appendChild(createChatLi("Sorry, there was an error processing your message.", "incoming"));
    });
  }

  const handleChat = () => {
    let userMessage = chatInput.value.trim();

    if (!userMessage) return;

    chatbox.appendChild(createChatLi(userMessage, "outgoing"));
    generateResponse(userMessage); // Send user message to the server and handle response

    chatInput.value = ''; // Clear input field
  };

  sendChatBtn.addEventListener("click", handleChat);
});
