let selectedCategory = null;

document.addEventListener('DOMContentLoaded', function () {
  const chatbotToggler = document.querySelector(".chatbot-toggler");
  const chatbot = document.querySelector(".chatbot");
  let isChatbotInitialized = false;

  // Function to initialize the chatbot
  function initializeChatbot() {
      const chatInput = document.querySelector(".chat-input textarea");
      const sendChatBtn = document.querySelector(".chat-input span");
      const chatbox = document.querySelector(".chatbox");


      // Start with the thinking animation
  showTypingAnimation();

  // After the thinking animation, show the greeting
  setTimeout(() => {
    hideTypingAnimation();
    chatbox.appendChild(createChatLi("Hei! Jeg er Sunnmørspostens Chatbot!", "incoming"));
    chatbox.scrollTop = chatbox.scrollHeight;

    // Start the thinking animation again
    showTypingAnimation();

    // After that animation, show the FAQ buttons
    setTimeout(() => {
      hideTypingAnimation();
      createFaqButtons(); // This function appends the buttons to the chatbox

      // Start the thinking animation again
      showTypingAnimation();

      // Finally, after that animation, show the follow-up message
      setTimeout(() => {
        hideTypingAnimation();
        const clickButtonMessage = "Trykk på en av knappene, eller spør et spørsmål i chatten. :D"
;
        chatbox.appendChild(createChatLi(clickButtonMessage, "incoming"));
        chatbox.scrollTop = chatbox.scrollHeight;
      }, 1500); // Delay for the third thinking animation

    }, 1500); // Delay for the second thinking animation

  }, 1500); // Delay for the first thinking animation

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
  
// Define the createFaqButtons function
const createFaqButtons = () => {
  // Check if FAQ buttons have already been created to prevent duplicates
  if (chatbox.querySelector('.faq-button')) {
    return; // FAQ buttons already exist, so don't create them again
  }

  const faqs = [
    { text: "Bli Abonnent", pattern: "bli abonnent" },
    { text: "Relevante artikler", pattern: "relevante artikler" },
    { text: "Artikler for Ungdom", pattern: "artikler ungdom" },
    { text: "Kategorier", pattern: "hvilke kategorier" }
  ];

  // Create container div for FAQ buttons
  const buttonsContainer = document.createElement('div');
  buttonsContainer.classList.add('faq-buttons-container');

  faqs.forEach(faq => {
    const button = document.createElement('button');
    button.classList.add('faq-button', 'category-button'); // Apply both classes for styling
    button.setAttribute('data-pattern', faq.pattern);
    button.textContent = faq.text;
    buttonsContainer.appendChild(button);
  });

  chatbox.appendChild(createChatLi(buttonsContainer, "incoming"));
  chatbox.scrollTop = chatbox.scrollHeight;

  // Attach event listeners to FAQ buttons
  const faqButtons = chatbox.querySelectorAll('.faq-button');
  faqButtons.forEach(button => {
    button.addEventListener('click', function() {
      const pattern = this.getAttribute('data-pattern');
      generateResponse(pattern); // Process the FAQ pattern as a user message
    });
  });
    // Append FAQ buttons to the chatbox
    chatbox.appendChild(createChatLi(buttonsContainer, "incoming"));
    chatbox.scrollTop = chatbox.scrollHeight;
  
    // Add a message after the FAQ buttons
    //const clickButtonMessage = "Trykk på en av knappene, eller spør et spørsmål i chatten. :D";
    //chatbox.appendChild(createChatLi(clickButtonMessage, "incoming"));
    //chatbox.scrollTop = chatbox.scrollHeight;
  
};

  // Call createFaqButtons to create and append FAQ buttons once
  //createFaqButtons();

    // Define the showTypingAnimation function
    function showTypingAnimation() {
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
      chatbox.scrollTop = chatbox.scrollHeight;
  }

  // Define the hideTypingAnimation function
  function hideTypingAnimation() {
      const typingLi = document.getElementById('typing-animation');
      if (typingLi) {
          typingLi.remove();
      }
  }

// Fetch and display categories
const fetchAndDisplayCategories = () => {
  return new Promise((resolve, reject) => {
    fetch('http://localhost:3000/categories')
      .then(response => response.json())
      .then(categories => {
        if (categories.length) {
          const buttonsContainer = document.createElement('div');
          buttonsContainer.classList.add('category-buttons-container');
          
          categories.forEach(category => {
            const button = document.createElement('button');
            button.classList.add('category-button');
            button.textContent = category;
            button.setAttribute('data-category', category);
            buttonsContainer.appendChild(button);
          });
          
          chatbox.appendChild(createChatLi(buttonsContainer, "incoming"));
          
          // Attach event listeners to the category buttons
          buttonsContainer.querySelectorAll('.category-button').forEach(button => {
            button.addEventListener('click', function() {
              selectedCategory = this.getAttribute('data-category');
              chatbox.appendChild(createChatLi(`Du valgte kategori: ${selectedCategory}. Hva ønsker du jeg skal gjøre?`, "incoming"));

              // Create and display the three new buttons
              const optionsContainer = document.createElement('div');
              optionsContainer.classList.add('faq-buttons-container');
              
              const options = [
                { text: "Nyeste artikler", action: "latest" },
                { text: "Viktigste artikler", action: "important" },
                { text: "Tilfeldig artikkel", action: "random" }
              ];
              
              options.forEach(opt => {
                const optionButton = document.createElement('button');
                optionButton.classList.add('option-button', 'faq-button');
                optionButton.textContent = opt.text;
                optionButton.setAttribute('data-action', opt.action);
                optionsContainer.appendChild(optionButton);
              });

              chatbox.appendChild(createChatLi(optionsContainer, "incoming"));
              chatbox.scrollTop = chatbox.scrollHeight;

              // Attach event listeners to the new option buttons
              optionsContainer.querySelectorAll('.option-button').forEach(optionButton => {
                optionButton.addEventListener('click', function() {
                  const action = this.getAttribute('data-action');
                  handleCategoryAction(selectedCategory, action);
                });
              });
            });
          });
          
          chatbox.scrollTop = chatbox.scrollHeight;
          resolve(); // Resolve the promise after categories are displayed
        } else {
          chatbox.appendChild(createChatLi("There are no categories available at the moment.", "incoming"));
          reject(new Error("No categories available")); // Reject the promise if no categories are found
        }
        chatbox.scrollTop = chatbox.scrollHeight;
      })
      .catch(error => {
        console.error('Error fetching categories:', error);
        chatbox.appendChild(createChatLi("Sorry, I am unable to fetch categories at the moment.", "incoming"));
        chatbox.scrollTop = chatbox.scrollHeight;
        reject(error); // Reject the promise on error
      });
  });
};




  // Function to display articles for a category
const displayArticlesForCategory = (category) => {
  fetch(`http://localhost:3000/articles/${category}`)
    .then(response => response.json())
    .then(articles => {
      let message = articles.map(article => `- ${article.title}`).join('\n');
      chatbox.appendChild(createChatLi(message, "incoming"));
      chatbox.scrollTop = chatbox.scrollHeight;
    })
    .catch(error => {
      console.error('Error fetching articles:', error);
      chatbox.appendChild(createChatLi(`Sorry, I was unable to fetch articles for ${category}.`, "incoming"));
      chatbox.scrollTop = chatbox.scrollHeight;
    });
};

// Function to handle actions for a selected category
const handleCategoryAction = (category, action) => {
  let endpoint = '';
  switch (action) {
    case 'latest':
      endpoint = `/Articles/${category}/latest`;
      break;
    case 'important':
      endpoint = `/Articles/${category}/important`;
      break;
    case 'random':
      endpoint = `/Articles/${category}/random`;
      break;
    default:
      chatbox.appendChild(createChatLi("Unknown action.", "incoming"));
      return;
  }

  fetch(`http://localhost:3000${endpoint}`)
    .then(response => response.json())
    .then(articles => {
      if (articles.length === 0) {
        chatbox.appendChild(createChatLi("There are no articles available for this selection.", "incoming"));
      } else {
        // Use the map function to iterate over articles and create anchor elements
        const articlesHtml = articles.map(article => {
          const anchorElement = document.createElement('a');
          anchorElement.href = article.url;
          anchorElement.textContent = article.title;
          anchorElement.target = "_blank";
          return anchorElement.outerHTML; // Get the HTML string of the anchor element
        }).join('<br><br>'); // Join them with a line break
        
        // Create a chat message with the articles HTML
        chatbox.appendChild(createChatLi(articlesHtml, "incoming"));
      }
      chatbox.scrollTop = chatbox.scrollHeight;
    })
    .catch(error => {
      console.error('Error:', error);
      chatbox.appendChild(createChatLi("Sorry, there was an error fetching the articles.", "incoming"));
    });
};


// Modify the generateResponse function
const generateResponse = (userMessage) => {
  const userMessageLower = userMessage.toLowerCase();

  // Show the typing animation
  showTypingAnimation();

  // Check for hardcoded responses or need for GPT processing
  if (userMessageLower.includes("hvilke kategorier")) {
    // For hardcoded responses, set a timeout to match the animation
    setTimeout(() => {
      fetchAndDisplayCategories().then(() => {
        // After fetching categories, hide the typing animation
        hideTypingAnimation();
      }).catch(error => {
        console.error('Error fetching categories:', error);
        chatbox.appendChild(createChatLi("Sorry, I am unable to fetch categories at the moment.", "incoming"));
        hideTypingAnimation();
      });
    }, 1500); // Delay should match your typing animation
  } else {
    // If it's not a hardcoded response, handle with GPT
    let endpoint;
    if (window.chatCategories && window.chatCategories.map(c => c.toLowerCase()).includes(userMessageLower)) {
      selectedCategory = window.chatCategories.find(c => c.toLowerCase() === userMessageLower);
      endpoint = `/Articles/${selectedCategory}`;
    } else {
      endpoint = '/ask';
    }

    // Use fetch for both GPT responses and selected category articles
    fetch(`http://localhost:3000${endpoint}`, {
      method: endpoint === '/ask' ? 'POST' : 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      body: endpoint === '/ask' ? JSON.stringify({ message: userMessage }) : null,
    })
    .then(response => response.json())
    .then(data => {
      setTimeout(() => {
        hideTypingAnimation(); // Hide typing animation
        // If there's a response from the GPT or selected category
        if (data && data.response) {
          chatbox.appendChild(createChatLi(data.response, "incoming"));
        } else {
          // If the API returned a different structure, handle it
          // This is a placeholder, adapt based on your actual API response structure
          chatbox.appendChild(createChatLi("Received data, but format was unexpected.", "incoming"));
        }
        chatbox.scrollTop = chatbox.scrollHeight;
      }, 1500); // Ensure the message is displayed after the animation
    })
    .catch(error => {
      console.error('Error:', error);
      hideTypingAnimation(); // Hide typing animation on error
      chatbox.appendChild(createChatLi("Sorry, there was an error processing your message.", "incoming"));
    });
  }
};
        // Function to handle chat messages
        function handleChat() {
          // Your existing handleChat function logic
          let userMessage = chatInput.value.trim();
          if (!userMessage) return;

          chatbox.appendChild(createChatLi(userMessage, "outgoing"));
          chatbox.scrollTop = chatbox.scrollHeight;
          generateResponse(userMessage); // Send user message to the server and handle response
          chatInput.value = ''; // Clear input field after sending
      }

      // Event listeners for sending a message
      sendChatBtn.addEventListener("click", handleChat);
      chatInput.addEventListener("keypress", function(event) {
          if (event.key === "Enter") {
              event.preventDefault();
              sendChatBtn.click();
          }
      });
  }

    // Function to toggle the chat window and initialize chatbot
    chatbotToggler.addEventListener('click', function() {
      if (!chatbot.classList.contains('show-chatbot') && !chatbot.classList.contains('initialized')) {
          initializeChatbot();
          chatbot.classList.add('initialized');
      }
      chatbot.classList.toggle("show-chatbot");
  });

  fetch('../header.component.html')
    .then(response => response.text())
    .then(data => {
        document.getElementById('header-placeholder').innerHTML = data;
    })
    .catch(error => console.error('Error loading the header component:', error));

// Handle enter key for sending a message
chatInput.addEventListener("keypress", function(event) {
  if (event.key === "Enter") {
    event.preventDefault();
    console.log("Enter pressed"); // Debugging log
    sendChatBtn.click();
  }
});

  function navigateTo(path) {
    // Assuming 'path' already includes the '.html' extension as needed
    const url = `http://localhost:3000/${path}`; // Construct the full URL
    
    fetch(url)
        .then(response => response.text())
        .then(html => {
            document.getElementById('main-content').innerHTML = html;
            window.history.pushState({}, '', url); // Update the URL displayed in the browser
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

  function addNavigationEventListeners() {
    const navLinks = document.querySelectorAll('.nav-link');
  
    navLinks.forEach(link => {
      link.addEventListener('click', function(event) {
        event.preventDefault();
        const path = this.getAttribute('href');
        navigateTo(path);
      });
    });
  }
    // Load header component
    fetch('../header.component.html')
    .then(response => response.text())
    .then(data => {
        document.getElementById('header-placeholder').innerHTML = data;
        // Additional logic after header is loaded, if needed
    })
    .catch(error => console.error('Error loading the header component:', error));

});