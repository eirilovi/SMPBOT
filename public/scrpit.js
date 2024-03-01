
let selectedCategory = null;

document.addEventListener('DOMContentLoaded', function () {
  const chatInput = document.querySelector(".chat-input textarea");
  const sendChatBtn = document.querySelector(".chat-input span");
  const chatbox = document.querySelector(".chatbox");

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
    { text: "How to Subscribe", pattern: "how to subscribe" },
    { text: "Subscription Plans", pattern: "what are the subscription plans" },
    { text: "Cancel Subscription", pattern: "how to cancel subscription" },
    { text: "Access Subscriber Content", pattern: "how can I access subscriber content" }
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
    const clickButtonMessage = "Click on a box, or ask a question in the chat. :D";
    chatbox.appendChild(createChatLi(clickButtonMessage, "incoming"));
    chatbox.scrollTop = chatbox.scrollHeight;
  
};

  // Call createFaqButtons to create and append FAQ buttons once
  createFaqButtons();

// Fetch and display categories
const fetchAndDisplayCategories = () => {
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
        
        // Attach event listeners to the newly created category buttons
        buttonsContainer.querySelectorAll('.category-button').forEach(button => {
          button.addEventListener('click', function() {
            const category = this.getAttribute('data-category');
            displayArticlesForCategory(category);
          });
        });
      } else {
        chatbox.appendChild(createChatLi("There are no categories available at the moment.", "incoming"));
      }
      chatbox.scrollTop = chatbox.scrollHeight;
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
  chatInput.value = ''; // Clear input field after sending
};

// Event listeners for sending a message
sendChatBtn.addEventListener("click", handleChat);
chatInput.addEventListener("keypress", function(event) {
  if (event.key === "Enter") {
    event.preventDefault();
    sendChatBtn.click();
  }
});

sendChatBtn.addEventListener("click", handleChat);

// Handle enter key for sending a message
chatInput.addEventListener("keypress", function(event) {
  if (event.key === "Enter") {
    event.preventDefault();
    console.log("Enter pressed"); // Debugging log
    sendChatBtn.click();
  }
});

});
