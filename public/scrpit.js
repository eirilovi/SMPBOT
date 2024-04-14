let selectedCategory = null;


// Define the showTypingAnimation function
function showTypingAnimation() {
  const chatbox = document.querySelector(".chatbox")
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

  function processArticles(articles, index, chatbox) {
    if (index < articles.length) {
        showTypingAnimation();

        // Introduce a small delay for visual effect
        setTimeout(() => {
            hideTypingAnimation();
            const article = articles[index];
            const articleInfo = `${article.title} <a href="${article.url}" target="_blank">${article.url}</a>`;
            const articleLi = createChatLi(articleInfo, "incoming");
            chatbox.appendChild(articleLi);

            // Process the next article
            processArticles(articles, index + 1, chatbox);
        }, 1500); // adjust delay as needed
    } else {
        // All articles processed
        chatbox.scrollTop = chatbox.scrollHeight;
    }
}

  const handleCategoryAction = (category, action) => {
    let endpoint = '';
    const chatbox = document.querySelector(".chatbox");

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

    // Show typing animation
    showTypingAnimation();

    fetch(`http://localhost:3000${endpoint}`)
        .then(response => response.json())
        .then(articles => {
            hideTypingAnimation(); // Hide typing animation once the data is loaded

            if (articles.length === 0) {
                chatbox.appendChild(createChatLi("There are no articles available for this selection.", "incoming"));
            } else {
                const introMessage = "Her er noen artikler under kategorien " + category + " som du kanskje vil like:";
                chatbox.appendChild(createChatLi(introMessage, "incoming"));

                // Start processing articles from the first one
                processArticles(articles, 0, chatbox);
            }
            chatbox.scrollTop = chatbox.scrollHeight;
        })
        .catch(error => {
            console.error('Error:', error);
            hideTypingAnimation();
            chatbox.appendChild(createChatLi("Sorry, there was an error fetching the articles.", "incoming"));
            chatbox.scrollTop = chatbox.scrollHeight;
        });
};

document.addEventListener('DOMContentLoaded', function () {
  const chatbotToggler = document.querySelector(".chatbot-toggler");
  const chatbot = document.querySelector(".chatbot");
  let isChatbotInitialized = false;

  
  function getArticleIdFromUrl() {
    const url = new URL(window.location.href);
    const pathname = url.pathname;

    if (pathname.includes('article.html')) {
      return url.searchParams.get('id');
    }

    return null;
  }

  function runArticle(articleId) {
    showTypingAnimation();
    fetch(`http://localhost:3000/summarizeArticle/${articleId}`)
      .then(response => response.json())
      .then(data => {
        hideTypingAnimation();
        if (data.summary) {
          // Split the summary into sentences, then join with double line breaks
          const sentences = data.summary.split(/(?<=[.!?])\s+/);
          const formattedSummary = sentences.join('<br><br>');
  
          const summaryLi = createChatLi(formattedSummary, "incoming");
          const chatbox = document.querySelector(".chatbox");
          chatbox.appendChild(summaryLi);
          chatbox.scrollTop = chatbox.scrollHeight;
        }
      })
      .catch(error => {
        console.error('Error summarizing article:', error);
        const errorMessage = "Sorry, there was an error summarizing the article.";
        const errorLi = createChatLi(errorMessage, "incoming");
        const chatbox = document.querySelector(".chatbox");
        chatbox.appendChild(errorLi);
        chatbox.scrollTop = chatbox.scrollHeight;
      }).finally(hideTypingAnimation);
  }
  

  function fetchSimilarArticles(articleId) {
    fetch(`http://localhost:3000/similarArticles/${articleId}`)
        .then(response => response.json())
        .then(similarArticles => {
            const chatbox = document.querySelector(".chatbox");

            // Start by showing the typing animation
            showTypingAnimation();

            // Introduce a small delay before showing intro message
            setTimeout(() => {
                hideTypingAnimation();
                const introMessage = "Her er noen lignende artikler du kanskje vil like:";
                const introLi = createChatLi(introMessage, "incoming");
                chatbox.appendChild(introLi);

                if (similarArticles && similarArticles.length > 0) {
                    processArticles(similarArticles, 0, chatbox);
                } else {
                    const noArticlesMessage = "Ingen lignende artikler funnet.";
                    const noArticlesLi = createChatLi(noArticlesMessage, "incoming");
                    chatbox.appendChild(noArticlesLi);
                    chatbox.scrollTop = chatbox.scrollHeight;
                }
            }, 1500); // adjust delay as needed
        })
        .catch(error => {
            console.error('Error fetching similar articles:', error);
            hideTypingAnimation();
            const errorMessage = "Beklager, det oppstod en feil ved henting av lignende artikler.";
            const errorLi = createChatLi(errorMessage, "incoming");
            chatbox.appendChild(errorLi);
            chatbox.scrollTop = chatbox.scrollHeight;
        });
}

  //Function to initialize Chatbot
  function initializeChatbot() {
    const articleId = getArticleIdFromUrl();
  
    const chatInput = document.querySelector(".chat-input textarea");
    const sendChatBtn = document.querySelector(".chat-input span");
    const chatbox = document.querySelector(".chatbox");
  
    // Start with the thinking animation
    showTypingAnimation();
  
    // After the thinking animation, show the greeting
    setTimeout(() => {
      hideTypingAnimation();
      const greetingMessage = articleId
        ? `Velkommen til artikkel ${articleId}! Hvordan kan jeg hjelpe deg?`
        : "Hei! Jeg er Sunnmørspostens Chatbot!";
  
      chatbox.appendChild(createChatLi(greetingMessage, "incoming"));
      chatbox.scrollTop = chatbox.scrollHeight;
  
      // Start the thinking animation again
      showTypingAnimation();
  
      // After that animation, show the buttons based on the context
      setTimeout(() => {
        hideTypingAnimation();
        if (articleId) {
          const articleButtonsContainer = createArticleButtons();
          chatbox.appendChild(createChatLi(articleButtonsContainer, "incoming"));
        } else {
          createFaqButtons(); // This function appends the default FAQ buttons to the chatbox
        }
  
        // Start the thinking animation again
        showTypingAnimation();
  
        // Finally, after that animation, show the follow-up message
        setTimeout(() => {
          hideTypingAnimation();
          const clickButtonMessage = articleId
            ? "Trykk på en av artikkel-knappene, eller spør et spørsmål i chatten.😊"
            : "Trykk på en av knappene, eller spør et spørsmål i chatten.😊";
  
          chatbox.appendChild(createChatLi(clickButtonMessage, "incoming"));
          chatbox.scrollTop = chatbox.scrollHeight;
        }, 1500); // Delay for the third thinking animation
  
      }, 1500); // Delay for the second thinking animation
  
    }, 1500); // Delay for the first thinking animation
  
// Define the createFaqButtons function
const createFaqButtons = () => {
  // Check if FAQ buttons have already been created to prevent duplicates
  if (chatbox.querySelector('.faq-button')) {
    return; // FAQ buttons already exist, so don't create them again
  }

  const faqs = [
    { text: "Bli Abonnent", pattern: "bli abonnent" },
    { text: "Relevante artikler", pattern: "fetch relevant articles" },
    { text: "Artikler for Ungdom", pattern: "fetch ungdom articles" },  // Changed pattern
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
};

  // Function to create article-specific buttons
  function createArticleButtons() {
    const articleButtons = [
      { text: "Oppsummer artikkel", pattern: "summarize article" },
      { text: "Lignende artikler", pattern: "similar articles", id: articleId },
      { text: "Placeholder 3", pattern: "placeholder3" }
    ];

    const buttonsContainer = document.createElement('div');
    buttonsContainer.classList.add('faq-buttons-container');

    articleButtons.forEach(btn => {
      const button = document.createElement('button');
      button.classList.add('faq-button', 'category-button');
      if (btn.pattern === 'summarize article') {
        button.classList.add('summarize-article-button'); // Add this class to match the event listener selector
            // Event listener for 'Oppsummer artikkel' button
      button.onclick = () => {runArticle(articleId)}
        //button.setAttribute('data-article-id', articleId); // Set the article ID here
      }
      if (btn.pattern === "similar articles") {
        button.onclick = () => {fetchSimilarArticles(btn.id)};
      }
      button.setAttribute('data-pattern', btn.pattern);
      button.textContent = btn.text;
      buttonsContainer.appendChild(button);
    });

    return buttonsContainer;
  }


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
                showTypingAnimation(); // Show typing animation on category button click
                selectedCategory = this.getAttribute('data-category');
                setTimeout(() => { // Simulate processing time
                  chatbox.appendChild(createChatLi(`Du valgte kategori: ${selectedCategory}. Hva ønsker du jeg skal gjøre?`, "incoming"));
  
                  const optionsContainer = document.createElement('div');
                  optionsContainer.classList.add('faq-buttons-container');
                  
                  const options = [
                    { text: "Nyeste artikler", action: "latest" },
                    { text: "Viktigste artikler", action: "important" },
                    { text: "Tilfeldig artikkel", action: "random" }
                  ];
                  
                  function articleButton(selectedCategory, action) {
                    showTypingAnimation(); // Show typing animation on option button click
                    setTimeout(() => { // Simulate processing time for action handling
                      handleCategoryAction(selectedCategory, action);
                      hideTypingAnimation(); // Hide typing animation after processing
                    }, 1500); // Adjust the timeout duration as per your requirements
                  };

                  options.forEach(opt => {
                    const optionButton = document.createElement('button');
                    optionButton.classList.add('option-button', 'faq-button');
                    optionButton.textContent = opt.text;
                    optionButton.setAttribute('data-action', opt.action);
                    optionsContainer.appendChild(optionButton);
  
                    // Attach event listeners to each option button
                    optionButton.onclick = () => {articleButton(selectedCategory, opt.action)}  
                  });
  
                  chatbox.appendChild(createChatLi(optionsContainer, "incoming"));
                  chatbox.scrollTop = chatbox.scrollHeight;
                  
                  hideTypingAnimation(); // Hide typing animation after category processing
                }, 1500); // Adjust the timeout duration as per your requirements
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

  const generateResponse = (userMessage) => {
    const userMessageLower = userMessage.toLowerCase();
    const chatbox = document.querySelector(".chatbox");
    showTypingAnimation(); // Start the typing animation initially
  
    setTimeout(() => { // Introduce a uniform delay for all actions
      hideTypingAnimation(); // Hide the initial typing animation
  
      if (userMessageLower.includes("hvilke kategorier")) {
        showTypingAnimation();
        setTimeout(() => {
          fetchAndDisplayCategories().then(() => {
            hideTypingAnimation(); // Hide animation after fetch
          }).catch(error => {
            console.error('Error fetching categories:', error);
            chatbox.appendChild(createChatLi("Sorry, I am unable to fetch categories at the moment.", "incoming"));
            hideTypingAnimation(); // Hide animation on error
          });
        }, 500);
      } else if (userMessageLower.includes("fetch ungdom articles")) {
        showTypingAnimation();
        setTimeout(() => {
          const endpoint = '/articlesUngdom';
          fetch(`http://localhost:3000${endpoint}`)
            .then(response => response.json())
            .then(articles => {
              hideTypingAnimation();
              const introMessage = "Her er noen artikler for ungdom du kanskje vil like:";
              chatbox.appendChild(createChatLi(introMessage, "incoming"));
              chatbox.scrollTop = chatbox.scrollHeight; // Ensure scroll adjustment after the intro
              processArticles(articles, 0, chatbox);
            })
            .catch(error => {
              console.error('Error fetching articles for Ungdom:', error);
              chatbox.appendChild(createChatLi("Sorry, there was an error fetching the articles.", "incoming"));
              hideTypingAnimation();
            });
        }, 500);
      } else if (userMessageLower.includes("fetch relevant articles")) {
        showTypingAnimation();
        setTimeout(() => {
          const endpoint = '/relevantArticles';
          fetch(`http://localhost:3000${endpoint}`)
            .then(response => response.json())
            .then(data => {
              hideTypingAnimation();
              if (data.articles && data.articles.length > 0) {
                const introMessage = data.message;
                chatbox.appendChild(createChatLi(introMessage, "incoming"));
                chatbox.scrollTop = chatbox.scrollHeight; // Ensure scroll adjustment after the intro
                processArticles(data.articles, 0, chatbox);
              } else {
                chatbox.appendChild(createChatLi("Det er for tiden ingen relevante artikler å vise.", "incoming"));
              }
            })
            .catch(error => {
              console.error('Error fetching relevant articles:', error);
              chatbox.appendChild(createChatLi("Sorry, there was an error fetching the articles.", "incoming"));
              hideTypingAnimation();
            });
        }, 500);
      } else {
        // Determine the endpoint based on whether the message is a category or general question
        let endpoint;
        if (window.chatCategories && window.chatCategories.map(c => c.toLowerCase()).includes(userMessageLower)) {
          selectedCategory = window.chatCategories.find(c => c.toLowerCase() === userMessageLower);
          endpoint = `/Articles/${selectedCategory}`;
        } else {
          endpoint = '/ask';
        }
  
        showTypingAnimation();
        setTimeout(() => {
          fetch(`http://localhost:3000${endpoint}`, {
            method: endpoint === '/ask' ? 'POST' : 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
            body: endpoint === '/ask' ? JSON.stringify({ message: userMessage }) : null,
          })
          .then(response => response.json())
          .then(data => {
            hideTypingAnimation();
            if (data && data.response) {
              if (Array.isArray(data.response)) {
                // Handle an array of responses
                data.response.forEach((item, index) => {
                  setTimeout(() => {
                    showTypingAnimation();
                    setTimeout(() => {
                      hideTypingAnimation();
                      let chatBubble;
                      if (item.type === 'text') {
                        chatBubble = createChatLi(item.content, "incoming");
                      } else if (item.type === 'article') {
                        const articleMessage = formatArticleMessage(item);
                        chatBubble = createChatLi(articleMessage, "incoming");
                      }
                      if (chatBubble) {
                        chatbox.appendChild(chatBubble);
                        chatbox.scrollTop = chatbox.scrollHeight; // Adjust scroll after each message
                      }
                    }, 500); // simulate typing for each response
                  }, index * 1000); // stagger the display of each response
                });
              } else {
                // Handle a single response
                chatbox.appendChild(createChatLi(data.response, "incoming"));
                chatbox.scrollTop = chatbox.scrollHeight; // Adjust scroll after single message
              }
            } else {
              chatbox.appendChild(createChatLi("Received data, but format was unexpected.", "incoming"));
              chatbox.scrollTop = chatbox.scrollHeight; // Adjust scroll after unexpected data
            }
          })
          .catch(error => {
            console.error('Error:', error);
            chatbox.appendChild(createChatLi("Sorry, there was an error processing your message.", "incoming"));
            hideTypingAnimation();
          });
        }, 500);
      }
    }, 1500); // Consistent delay to simulate the typing effect initially
  };  
  
const formatArticleMessage = (article) => {
  // Adjust this formatting as needed to match your front-end's expected structure
  return `
    <div class="article-message">
      <strong>${article.title}</strong><br>
      Author: ${article.author}<br>
      <p>${article.summary}</p>
      <a href="${article.url}" target="_blank">Read more</a>
    </div>
  `;
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
    // If the chatbot is not initialized yet, initialize it
    if (!chatbot.classList.contains('initialized')) {
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
    
    function updateChatbotForArticle(articleId) {
      fetch(`http://localhost:3000/Articles/${articleId}`)
          .then(response => response.json())
          .then(article => {
              if (article) {
                  // Updating the chatbot state
                  const chatbox = document.querySelector(".chatbox");
                  chatbox.appendChild(createChatLi(`Article Title: ${article.title}`, "incoming"));
                  chatbox.appendChild(createChatLi(`Article Author: ${article.author}`, "incoming"));
                  chatbox.appendChild(createChatLi(`Article Content: ${article.content.substring(0, 300)}...`, "incoming"));
                  chatbox.scrollTop = chatbox.scrollHeight;
              }
          })
          .catch(error => console.error('Error fetching article:', error));
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