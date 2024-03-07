
let selectedCategory = null;

document.addEventListener('DOMContentLoaded', function () {
  const chatInput = document.querySelector(".chat-input textarea");
  const sendChatBtn = document.querySelector(".chat-input span");
  const chatbox = document.querySelector(".chatbox");
  const chatbotToggler = document.querySelector(".chatbot-toggler");
  const chatbot = document.querySelector(".chatbot");
  
  const createChatLi = (message, className) => {
    const chatLi = document.createElement("li");
    chatLi.classList.add("chat", className);
    let chatContent = className === "outgoing" ? `<p>${message}</p>` : `<span class="material-symbols-outlined">smart_toy</span><p>${message}</p>`;
    chatLi.innerHTML = chatContent;
    return chatLi;
  }

  fetch('../header.component.html')
    .then(response => response.text())
    .then(data => {
        document.getElementById('header-placeholder').innerHTML = data;
    })
    .catch(error => console.error('Error loading the header component:', error));
      
    // Function to toggle the chat window
    chatbotToggler.addEventListener('click', function() {
      chatbot.classList.toggle("show-chatbot");
    });
  


// Fetch and display categories
const fetchAndDisplayCategories = () => {
  fetch('http://localhost:3000/categories')
    .then(response => response.json())
    .then(categories => {
      // Append a message asking which category the user is interested in
      chatbox.appendChild(createChatLi("Which category are you interested in?", "incoming"));

      if (categories.length) {
        // Append a button for each category in separate chat bubbles
        categories.forEach(category => {
          const buttonHtml = `<button class="category-button" data-category="${category}">${category}</button>`;
          chatbox.appendChild(createChatLi(buttonHtml, "incoming"));
        });
      } else {
        chatbox.appendChild(createChatLi("There are no categories available at the moment.", "incoming"));
      }

      // Scroll to the latest message after adding the initial question
      chatbox.scrollTop = chatbox.scrollHeight;

      // Use setTimeout to defer adding event listeners until after the buttons have been added to the DOM
      setTimeout(() => {
        // Add event listeners to the newly created buttons
        const categoryButtons = document.querySelectorAll('.category-button');
        categoryButtons.forEach(button => {
          button.addEventListener('click', function() {
            const category = this.getAttribute('data-category');
            displayArticlesForCategory(category);
          });
        });

        // Scroll to the latest message after adding the buttons
        chatbox.scrollTop = chatbox.scrollHeight;
      }, 0);
    })
    .catch(error => {
      console.error('Error fetching categories:', error);
      chatbox.appendChild(createChatLi("Sorry, I am unable to fetch categories at the moment.", "incoming"));
      chatbox.scrollTop = chatbox.scrollHeight;
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

// Modify the generateResponse function
const generateResponse = (userMessage) => {
  const userMessageLower = userMessage.toLowerCase();

  // If the user asks for categories, fetch and display them
  if (userMessageLower.includes("what categories are there")) {
    fetchAndDisplayCategories();
  }
  // If userMessage is a category from the list, prompt for listing articles
  else if (window.chatCategories && window.chatCategories.map(c => c.toLowerCase()).includes(userMessageLower)) {
    selectedCategory = window.chatCategories.find(c => c.toLowerCase() === userMessageLower); // Find the correctly cased category
    chatbox.appendChild(createChatLi(`You selected "${selectedCategory}". Would you like to see the articles? (yes/no)`, "incoming"));
    chatbox.scrollTop = chatbox.scrollHeight;
  }
  // If the user has selected a category and confirms to list articles
  else if (selectedCategory && userMessageLower === 'yes') {
    displayArticlesForCategory(selectedCategory);
    selectedCategory = null; // Reset selected category
  }
  // If the user has selected a category and denies to list articles
  else if (selectedCategory && userMessageLower === 'no') {
    chatbox.appendChild(createChatLi("Okay, let me know if you need anything else.", "incoming"));
    chatbox.scrollTop = chatbox.scrollHeight;
    selectedCategory = null; // Reset selected category
  }
  // For all other messages, proceed with the regular chat functionality
  else {
    fetch('http://localhost:3000/ask', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message: userMessage }),
    })
    .then(response => response.json())
    .then(data => {
        chatbox.appendChild(createChatLi(data.response, "incoming"));
        chatbox.scrollTop = chatbox.scrollHeight;
    })
    .catch(error => {
        console.error('Error:', error);
        chatbox.appendChild(createChatLi("Sorry, there was an error processing your message.", "incoming"));
        chatbox.scrollTop = chatbox.scrollHeight;
    });
  }
}


  const handleChat = () => {
    let userMessage = chatInput.value.trim();

    if (!userMessage) return;

    chatbox.appendChild(createChatLi(userMessage, "outgoing"));
    chatbox.scrollTop = chatbox.scrollHeight;
    generateResponse(userMessage); // Send user message to the server and handle response

    chatInput.value = ''; // Clear input field
  };

  sendChatBtn.addEventListener("click", handleChat);

  // Handle enter key for sending a message
  chatInput.addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
      event.preventDefault();
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
  fetch('../header.component.html')
  .then(response => response.text())
  .then(data => {
    document.getElementById('header-placeholder').innerHTML = data;
    addNavigationEventListeners(); // This will setup your click events after the header is loaded
  })
  .catch(error => console.error('Error loading the header component:', error));
  



});
