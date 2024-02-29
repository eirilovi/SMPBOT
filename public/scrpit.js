
//const supabase = new SupabaseClient('https://znkbdcqxhofjsrouwvkq.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpua2JkY3F4aG9manNyb3V3dmtxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDkxNDc2NDIsImV4cCI6MjAyNDcyMzY0Mn0.WdoUPztQZB0UnoSD_9u4xlgIKOEkhW4adm2OcQcc5Ek');


let selectedCategory = null;

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

  // Fetch and display categories
  const fetchAndDisplayCategories = () => {
    fetch('http://localhost:3000/categories')
      .then(response => response.json())
      .then(categories => {
        let message = `The categories available are: ${categories.join(', ')}. Which one are you interested in?`;
        chatbox.appendChild(createChatLi(message, "incoming"));
        chatbox.scrollTop = chatbox.scrollHeight;
        // Store the categories for later use
        window.chatCategories = categories;
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

    // ...
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
  chatInput.addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
      event.preventDefault();
      sendChatBtn.click();
    }
  });
});


