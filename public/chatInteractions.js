// Define the showTypingAnimation function
function showTypingAnimation() {
    const chatbox = document.querySelector(".chatbox");
    const chatInput = document.querySelector(".chat-input textarea");
    const specificButtons = document.querySelectorAll(".faq-button, .option-button, .category-button"); // Select specific buttons
  
    // Disable the chat input area and specific buttons
    chatInput.disabled = true;
    specificButtons.forEach(button => {
      button.disabled = true;  // Disable the button
      button.classList.add('disabled');  // Add a 'disabled' class for styling
    });
  
    // Check if the typing animation is already being shown
    if (!chatbox.querySelector("#typing-animation")) {
      const typingLi = document.createElement('li');
      typingLi.classList.add('chat', 'incoming');
      typingLi.id = 'typing-animation';
  
      const icon = document.createElement("span");
      icon.classList.add("material-symbols-outlined");
      icon.textContent = "smart_toy";
      typingLi.appendChild(icon);
  
      const typingAnimationContainer = document.createElement('div');
      typingAnimationContainer.classList.add('typing-animation');
  
      for (let i = 0; i < 3; i++) {
        const dot = document.createElement('div');
        dot.classList.add('typing-dot');
        typingAnimationContainer.appendChild(dot);
      }
  
      typingLi.appendChild(typingAnimationContainer);
      chatbox.appendChild(typingLi);
      scrollToBottomOfChat();
    }
  }
  
  // Define the hideTypingAnimation function
  function hideTypingAnimation() {
    const typingLi = document.getElementById('typing-animation');
    const chatInput = document.querySelector(".chat-input textarea");
    const specificButtons = document.querySelectorAll(".faq-button, .option-button, .category-button"); // Select specific buttons
  
    if (typingLi) {
        typingLi.remove();
    }
  
    // Re-enable the chat input area and specific buttons
    chatInput.disabled = false;
    specificButtons.forEach(button => {
      button.disabled = false;  // Enable the button
      button.classList.remove('disabled');  // Remove the 'disabled' class
    });
  }

     // Define the createChatLi function
     const createChatLi = (message, className) => {
        const chatLi = document.createElement("li");
        chatLi.classList.add("chat", className);
        // If the message is an element (like our buttons container), append it directly
        if (message instanceof Element) {
            chatLi.appendChild(message);
        } else if (message) { // Only create the <p> if there is a message
            // Assume it's text content and create a <p> for it
            const chatContent = document.createElement("p");
            chatContent.innerHTML = message;
            if(className === "outgoing") {
                chatLi.appendChild(chatContent);
            } else {
                const icon = document.createElement("span");
                icon.classList.add("material-symbols-outlined");
                icon.textContent = "smart_toy";
                chatLi.appendChild(icon);
                chatLi.appendChild(chatContent);
            }
        }
        
        return chatLi;
    };


