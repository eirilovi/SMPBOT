import { getArticleIdFromUrl } from './contentManagement.js'
import { limitTextInput } from './utils.js'
import { showTypingAnimation } from './chatInteractions.js'
import { hideTypingAnimation } from './chatInteractions.js'
import { scrollToBottomOfChat } from './utils.js'
import { createChatLi } from './chatInteractions.js'
import { createFaqButtons } from './contentManagement.js'
import { generateResponse } from './messageProcessing.js'
import { createArticleButtons } from './contentManagement.js'
import { updateChatbotForArticle } from './contentManagement.js'

document.addEventListener('DOMContentLoaded', function () {
  const chatbotToggler = document.querySelector(".chatbot-toggler");
  const chatbot = document.querySelector(".chatbot");

  //Function to initialize Chatbot
  function initializeChatbot() {
    const articleId = getArticleIdFromUrl();
  
    const chatInput = document.querySelector(".chat-input textarea");
    const sendChatBtn = document.querySelector(".chat-input span");
    const chatbox = document.querySelector(".chatbox");

// Function to resize textarea based on its content
function resizeTextarea() {
  const chatInput = document.querySelector(".chat-input textarea");
  const maxChars = 100; // Define the maximum number of characters allowed
  const chatboxSpacer = document.querySelector('.chatbox-spacer');
  const chatbox = document.querySelector('.chatbox');

  let previousHeight = chatInput.style.height ? parseInt(chatInput.style.height) : 50; // Get previous height or default to 50px if not set

  if (chatInput.value.length <= maxChars) {
    chatInput.style.height = '40px';  // Reset the height to auto to allow shrinkage if content is removed
    chatInput.style.height = chatInput.scrollHeight + 'px';  // Set to scroll height to fit content
  } else {
    chatInput.value = chatInput.value.substring(0, maxChars);  // Trim the value to maxChars
  }

  let currentHeight = parseInt(chatInput.style.height); // Get the new height
  let heightDifference = currentHeight - previousHeight;

  if (heightDifference !== 0) {
    // Adjust the height of the chatbox spacer
    chatboxSpacer.style.height = `${parseInt(getComputedStyle(chatboxSpacer).height) + heightDifference}px`;

    // Optionally adjust the height of the chatbox to prevent the chatbot from resizing
    chatbox.style.height = `${parseInt(getComputedStyle(chatbox).height) - heightDifference}px`;
  }
}


    // Event Listener for resizing textarea
    document.querySelector(".chat-input textarea").addEventListener('input', resizeTextarea);
  
      // Call the function to limit text input
    limitTextInput();
        // Add letter counter near the textarea
        const textArea = document.querySelector(".chat-input textarea");
        const counter = document.createElement('div');
        const warningMessage = document.querySelector("#warning-message");
 
        counter.classList.add('letter-counter');
        textArea.parentNode.insertBefore(counter, textArea.nextSibling);
        counter.textContent = '0/100'; // Initial counter value
         
        textArea.addEventListener('input', function() {
         counter.textContent = `${this.value.length}/100`; // Update counter on input
         if (this.value.length > 100) {
           this.value = this.value.slice(0, 100); // Ensure the limit is enforced
         }
         // Toggle warning message and adjust container padding when user reaches 100 characters
         if (this.value.length === 100) {
           warningMessage.classList.add('visible');      
           counter.classList.add('active'); // Apply the transformation
         } else {
           warningMessage.classList.remove('visible');
           counter.classList.remove('active'); // Apply the transformation
         }
       });

// Start with the thinking animation
showTypingAnimation();

// After the initial thinking animation, show the greeting
setTimeout(() => {
  hideTypingAnimation();  // Hide the initial typing animation

  const greetingMessage = articleId
    ? `Velkommen til artikkelen! 😊`
    : "NB: Vær oppmerksom på at dette er en AI-chatbot. Noen detaljer kan være unøyaktige.";

  chatbox.appendChild(createChatLi(greetingMessage, "incoming"));
  scrollToBottomOfChat();

  // Start the thinking animation again before showing the follow-up message
  showTypingAnimation();

  setTimeout(() => {
    hideTypingAnimation();  // Hide the typing animation after a delay

    const clickButtonMessage = articleId
      ? "Gjerne spør meg hvis du har spørsmål om artikkelen, eller benytt knappene nedenfor."
      : "Hei! Jeg er Sunnmørspostens Chatbot! 😊";

    chatbox.appendChild(createChatLi(clickButtonMessage, "incoming"));
    scrollToBottomOfChat();

    // Start another thinking animation before showing buttons based on the context
    showTypingAnimation();

    setTimeout(() => {
      hideTypingAnimation();  // Hide the typing animation after another delay

      if (articleId) {
        const articleButtonsContainer = createArticleButtons();
        chatbox.appendChild(createChatLi(articleButtonsContainer, "incoming"));
      } else {
        createFaqButtons();  // This function appends the default FAQ buttons to the chatbox
      }

      scrollToBottomOfChat();
    }, 500);  // Delay for showing article buttons or FAQ buttons

  }, 500);  // Delay for the follow-up message

}, 1500);  // Delay for the greeting message


        // Function to handle chat messages
        function handleChat() {
          // Your existing handleChat function logic
          let userMessage = chatInput.value.trim();
          if (!userMessage) return;

          chatbox.appendChild(createChatLi(userMessage, "outgoing"));
          scrollToBottomOfChat();
          generateResponse(userMessage); // Send user message to the server and handle response
          chatInput.value = ''; // Clear input field after sending
          resizeTextarea();  // Reset textarea height after clearing
          counter.textContent = '0/100'; // Reset the counter
          warningMessage.classList.remove('visible');
          counter.classList.remove('active'); // Apply the transformation
      }

      // Event listeners for sending a message
      sendChatBtn.addEventListener("click", handleChat);
      chatInput.addEventListener("keypress", function(event) {
          if (event.key === "Enter") {
              event.preventDefault();
              sendChatBtn.click();
              handleChat();
            }
          });
        
          // Initial resize in case there's text already (e.g., loading saved drafts)
          resizeTextarea();
        };

  // Function to toggle the chat window and initialize chatbot
  chatbotToggler.addEventListener('click', function() {
    
    // If the chatbot is not initialized yet, initialize it
    if (!chatbot.classList.contains('initialized')) {
      initializeChatbot();
      chatbot.classList.add('initialized');
    }
    chatbot.classList.toggle("show-chatbot");
  });

  // Add event listener to the close icon
const closeIcon = document.getElementById('close-icon');
closeIcon.addEventListener('click', function() {
    chatbot.classList.remove('show-chatbot');
});

  fetch('../header.component.html')
    .then(response => response.text())
    .then(data => {
        document.getElementById('header-placeholder').innerHTML = data;
    })
    .catch(error => console.error('Error loading the header component:', error));

    function navigateTo(path) {
      fetch(`http://localhost:3000/${path}`)
          .then(response => response.text())
          .then(html => {
              document.getElementById('main-content').innerHTML = html;
              window.history.pushState({}, '', `http://localhost:3000/${path}`);
    
              // Extract article ID from the URL
              const articleId = path.includes('article.html') ? new URLSearchParams(new URL(path, document.baseURI).search).get('id') : null;
              if (articleId) {
                  updateChatbotForArticle(articleId);
              }
          })
          .catch(error => console.error('Error fetching content:', error));
    }
    
  // Listen for click events on your navigation links/buttons
  document.addEventListener('click', function(event) {
    if (event.target.matches('.nav-link')) { // Replace with your actual selector
      event.preventDefault();
      const href = event.target.getAttribute('href');
      navigateTo(href);
    }
  });    
    
  // Handle back/forward browser navigation
  window.addEventListener('popstate', function() {
    navigateTo(window.location.pathname);
  });

    // Load header component
    fetch('../header.component.html')
    .then(response => response.text())
    .then(data => {
        document.getElementById('header-placeholder').innerHTML = data;
        // Additional logic after header is loaded, if needed
    })
    .catch(error => console.error('Error loading the header component:', error));

});