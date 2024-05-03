let selectedCategory = null;


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
    } else if (userMessageLower.includes("kundeservice sporsmal")) {
      showTypingAnimation(); // Show typing animation before fetching CS buttons
      setTimeout(() => {
          fetchCSButtons(); // Run the function to generate customer service buttons
          hideTypingAnimation(); // Hide typing animation after fetching buttons
          scrollToBottomOfChat(); // Ensure scroll adjustment after the intro
      }, 500);
  }   else if (userMessageLower.includes("fetch ungdom articles")) {
      showTypingAnimation();
      setTimeout(() => {
        const endpoint = '/articlesUngdom';
        fetch(`http://localhost:3000${endpoint}`)
          .then(response => response.json())
          .then(articles => {
            hideTypingAnimation();
            const introMessage = "Her er noen artikler for ungdom du kanskje vil like: 😊";
            chatbox.appendChild(createChatLi(introMessage, "incoming"));
            scrollToBottomOfChat(); // Ensure scroll adjustment after the intro
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
              scrollToBottomOfChat(); // Ensure scroll adjustment after the intro
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
                      console.log("Article data received:", item); // This will show what data is being passed
                      const articleMessage = formatArticleMessage({
                        title: item.title,
                        author: item.author,
                        summary: item.summary,
                        url: item.url
                      });
                      chatBubble = createChatLi(articleMessage, "incoming");
                    } else if (item.type === 'confirm') {
                      const confirmMessageText = createChatLi(item.content, "incoming");
                      chatbox.appendChild(confirmMessageText);
                    
                      const buttonContainer = document.createElement('div');
                      buttonContainer.classList.add('confirm-message-container');
                    
                      const yesButton = document.createElement('button');
                      yesButton.textContent = "Ja";
                      yesButton.classList.add('confirm-button');
                      yesButton.onclick = () => {
                          processArticles(item.articles, 0, chatbox);
                      };
                    
                      const noButton = document.createElement('button');
                      noButton.textContent = "Nei";
                      noButton.classList.add('confirm-button');
                      noButton.onclick = () => {
                          showTypingAnimation(); // Show typing animation
                          setTimeout(() => { // Set timeout to simulate delay
                              fetch('/askOpenAIForResponse', {
                                  method: 'POST',
                                  headers: {
                                      'Content-Type': 'application/json',
                                  },
                                  body: JSON.stringify({ message: userMessage }), // Send the user message to the server
                              })
                              .then(response => response.json())
                              .then(data => {
                                  hideTypingAnimation(); // Hide typing animation after response is received
                                  const responseData = data.response[0]; // Access the first item in the response array
                                  if (responseData && responseData.type === 'text') {
                                      chatbox.appendChild(createChatLi(responseData.content, "incoming")); // Append responseData.content
                                  } else {
                                      console.error('Unexpected response:', data);
                                  }
                                  scrollToBottomOfChat();
                              })
                              .catch(error => {
                                  console.error('Error requesting response from GPT model:', error);
                                  chatbox.appendChild(createChatLi("Sorry, there was an error processing your request.", "incoming"));
                                  hideTypingAnimation();
                              });
                          }, 1500); // 1.5-second delay before sending request
                      };                      
                      
                      buttonContainer.appendChild(yesButton);
                      buttonContainer.appendChild(noButton);
                      chatbox.appendChild(buttonContainer);
                      scrollToBottomOfChat();
                  }
                    if (chatBubble) {
                      chatbox.appendChild(chatBubble);
                      scrollToBottomOfChat();
                    }
                  }, 500); // simulate typing for each response
                }, index * 1000); // stagger the display of each response
              });
            } else {
              // Handle a single response
              chatbox.appendChild(createChatLi(data.response, "incoming"));
              scrollToBottomOfChat();
            }
          } else {
            chatbox.appendChild(createChatLi("Received data, but format was unexpected.", "incoming"));
            scrollToBottomOfChat();
          }
        })
        .catch(error => {
          console.error('Error:', error);
          chatbox.appendChild(createChatLi("Sorry, there was an error processing your message.", "incoming"));
          hideTypingAnimation();
        });
      }, 500);
    }
  }, 500); // Consistent delay to simulate the typing effect initially  
};

const fetchAndDisplayCategories = () => {
  const chatbox = document.querySelector(".chatbox");
  return new Promise((resolve, reject) => {
    fetch('http://localhost:3000/categories')
      .then(response => response.json())
      .then(categories => {
        if (categories.length) {
          // Display intro message with typing animation
          showTypingAnimation();
          setTimeout(() => {
            hideTypingAnimation();
            chatbox.appendChild(createChatLi("Vennligst velg én av kategoriene: 😊", "incoming"));
            scrollToBottomOfChat();

            // Delay to show typing animation again before displaying the category buttons
            showTypingAnimation();
            setTimeout(() => {
              hideTypingAnimation();
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
              scrollToBottomOfChat();
              
              // Attach event listeners to the category buttons
              buttonsContainer.querySelectorAll('.category-button').forEach(button => {
                button.addEventListener('click', function() {
                  showTypingAnimation(); // Show typing animation on category button click
                  selectedCategory = this.getAttribute('data-category');
                  setTimeout(() => { // Simulate processing time
                    hideTypingAnimation();
                    chatbox.appendChild(createChatLi(`Du valgte kategori: ${selectedCategory}. Hva ønsker du jeg skal gjøre? 😊`, "incoming"));
                    scrollToBottomOfChat();

                    showTypingAnimation(); // Show typing animation before displaying options
                    setTimeout(() => {
                      hideTypingAnimation();
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

                        // Attach event listeners to each option button
                        optionButton.onclick = () => {
                          showTypingAnimation(); // Show typing animation on option button click
                          setTimeout(() => { // Simulate processing time for action handling
                            handleCategoryAction(selectedCategory, opt.action);
                            hideTypingAnimation(); // Hide typing animation after processing
                            scrollToBottomOfChat();
                          }, 0); // Adjust the timeout duration as per your requirements
                        };  
                      });

                      chatbox.appendChild(createChatLi(optionsContainer, "incoming"));
                      scrollToBottomOfChat();
                    }, 500); // Typing animation delay for options
                  }, 500); // Delay after category selection
                });
              });

              resolve(); // Resolve the promise after categories are displayed
            }, 500); // Delay before showing category buttons to simulate typing
          }, 500); // Delay for the intro message typing simulation
        } else {
          chatbox.appendChild(createChatLi("There are no categories available at the moment.", "incoming"));
          reject(new Error("No categories available")); // Reject the promise if no categories are found
        }
        scrollToBottomOfChat();
      })
      .catch(error => {
        console.error('Error fetching categories:', error);
        chatbox.appendChild(createChatLi("Sorry, I am unable to fetch categories at the moment.", "incoming"));
        scrollToBottomOfChat();
        reject(error); // Reject the promise on error
      });
  });
};

  // Define the createFaqButtons function
  const createFaqButtons = () => {
    const chatbox = document.querySelector(".chatbox");
    // Check if FAQ buttons have already been created to prevent duplicates
    if (chatbox.querySelector('.faq-button')) {
      return; // FAQ buttons already exist, so don't create them again
    }
  
    const faqs = [
      { text: "Bli Abonnent", pattern: "bli abonnent" },
      { text: "Relevante artikler", pattern: "fetch relevant articles" },
      { text: "Artikler for Ungdom", pattern: "fetch ungdom articles" },  // Changed pattern
      { text: "Kategorier", pattern: "hvilke kategorier" },
      { text: "Kundeservice", pattern: "kundeservice sporsmal" }
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
    scrollToBottomOfChat();
    
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
      scrollToBottomOfChat();
  };

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
            console.log("Article at index", index, article); // Log the article to check its properties
            const formattedArticle = formatArticleMessage(article); // Format the article
            const articleLi = createChatLi(formattedArticle, "incoming"); // Use formatted article
            chatbox.appendChild(articleLi);

            // Process the next article
            processArticles(articles, index + 1, chatbox);
        }, 1500); // adjust delay as needed
    } else {
        // All articles processed
        scrollToBottomOfChat();
    }
}

document.addEventListener('scroll', function() {
  const scrollComponent = document.querySelector(".chatbox"); // Target the chatbox for scroll events
  let scrollToTopBtn = document.getElementById('scrollToTopBtn');

  if (scrollComponent.scrollTop > 100) {
      scrollToTopBtn.style.display = "block";
  } else {
      scrollToTopBtn.style.display = "none";
  }
});

document.getElementById('scrollToTopBtn').addEventListener('click', function() {
  const scrollComponent = document.querySelector(".chatbox");
  scrollComponent.scrollTo({
      top: 0,
      behavior: "smooth"
  });
});

const formatArticleMessage = (article) => {
    // Determine how many characters you want to show in the summary
    const summaryCharacterLimit = 100;
    let truncatedSummary = article.content || ''; // Handle undefined summary
  
    // Truncate the summary if it's longer than the summaryCharacterLimit
    if (truncatedSummary.length > summaryCharacterLimit) {
        truncatedSummary = truncatedSummary.substring(0, summaryCharacterLimit) + '...';
    }

    console.log("Truncated summary:", truncatedSummary); // Log truncated summary

    // Adjust this formatting as needed to match your front-end's expected structure
    return `
    <div class="article-message">
        <strong>${article.title}</strong><br>
        <div class="article-details">
            <span class="author">${article.author}</span><br>
            <br><span class="summary">${truncatedSummary}</span><br> <!-- Use truncated summary -->
            <a href="${article.url}" target="_blank"><strong>Les her</strong></a>
        </div>
    </div>
    `;
}

function smoothScrollToBottom(element) {
  let start = null;
  const duration = 200; // Duration of the animation in milliseconds

  function step(timestamp) {
      if (!start) start = timestamp;

      const elapsedTime = timestamp - start;
      const progress = elapsedTime / duration;

      const currentPosition = element.scrollTop;
      const targetPosition = element.scrollHeight - element.clientHeight;

      // Use a simple ease-out function for smooth animation
      // `progress` is squared to create an ease-out effect
      const nextPosition = currentPosition + (targetPosition - currentPosition) * Math.min(progress * progress, 1);

      element.scrollTop = nextPosition;

      // Continue the animation as long as we haven't run out of time and haven't reached the target
      if (elapsedTime < duration && element.scrollTop < targetPosition) {
          window.requestAnimationFrame(step);
      } else {
          // Ensure it's exactly at the bottom in case of small discrepancies
          element.scrollTop = targetPosition;
      }
  }

  window.requestAnimationFrame(step);
}

function limitTextInput() {
  const chatInput = document.querySelector(".chat-input textarea");

  // Add an event listener to handle input changes
  chatInput.addEventListener('input', function() {
    if (this.value.length > 100) {
      this.value = this.value.slice(0, 100); // Cut down the value to 100 characters
    }
  });
}

function scrollToBottomOfChat() {
  const chatbox = document.querySelector(".chatbox");
  smoothScrollToBottom(chatbox);
}


function fetchSimilarArticles(articleId) {
  const chatbox = document.querySelector(".chatbox");
  
  // Start by showing the typing animation immediately when the button is clicked, before initiating the fetch.
  showTypingAnimation();

  fetch(`http://localhost:3000/similarArticles/${articleId}`)
      .then(response => response.json())
      .then(similarArticles => {
          // Use setTimeout to introduce a controlled delay for showing results after fetching
          setTimeout(() => {
              hideTypingAnimation();
              const introMessage = "Her er noen lignende artikler du kanskje vil like: 😊";
              const introLi = createChatLi(introMessage, "incoming");
              chatbox.appendChild(introLi);

              if (similarArticles && similarArticles.length > 0) {
                  processArticles(similarArticles, 0, chatbox);
              } else {
                  const noArticlesMessage = "Ingen lignende artikler funnet.";
                  const noArticlesLi = createChatLi(noArticlesMessage, "incoming");
                  chatbox.appendChild(noArticlesLi);
                  scrollToBottomOfChat();
              }
          }, 1500); // This delay is to simulate the typing duration, not to compensate for fetch time
      })
      .catch(error => {
          console.error('Error fetching similar articles:', error);
          hideTypingAnimation();
          const errorMessage = "Beklager, det oppstod en feil ved henting av lignende artikler.";
          const errorLi = createChatLi(errorMessage, "incoming");
          chatbox.appendChild(errorLi);
          scrollToBottomOfChat();
      });
}

function fetchContextArticles(articleId) {
const chatbox = document.querySelector(".chatbox");
showTypingAnimation();  // Start typing animation immediately

fetch(`http://localhost:3000/articlesInSeries/${articleId}`)
  .then(response => response.json())
  .then(contextArticles => {
    setTimeout(() => {
      hideTypingAnimation();  // Hide typing animation after fetching data
      const introMessage = "Disse artiklene er fra samme serie, og kan hjelpe deg med å få overblikk over saken:😊";
      const introLi = createChatLi(introMessage, "incoming");
      chatbox.appendChild(introLi);

      if (contextArticles && contextArticles.length > 0) {
        processArticles(contextArticles, 0, chatbox);  // Assuming you have a function to process and display articles
      } else {
        const noArticlesMessage = "Ingen andre artikler i denne serien.";
        const noArticlesLi = createChatLi(noArticlesMessage, "incoming");
        chatbox.appendChild(noArticlesLi);
        scrollToBottomOfChat();
      }
    }, 1500);  // Delay to simulate the typing duration
  })
  .catch(error => {
    console.error('Error fetching context articles:', error);
    hideTypingAnimation();
    const errorMessage = "Beklager, det oppstod en feil ved henting av artikler fra serien.";
    const errorLi = createChatLi(errorMessage, "incoming");
    chatbox.appendChild(errorLi);
    scrollToBottomOfChat();
  });
}


const handleCategoryAction = (category, action) => {
  let endpoint = '';
  const chatbox = document.querySelector(".chatbox");
  let introMessage = ""; // Declare variable to hold the intro message based on the action

  switch (action) {
    case 'latest':
      endpoint = `/Articles/${category}/latest`;
      introMessage = `Her er noen av de nyeste artiklene under kategorien: ${category} 😊`;
      break;
    case 'important':
      endpoint = `/Articles/${category}/important`;
      introMessage = `Her er noen av de viktigste artiklene under kategorien: ${category} 😊`;
      break;
    case 'random':
      endpoint = `/Articles/${category}/random`;
      introMessage = `Her er en tilfeldig artikkel under kategorien: ${category} 😊`;
      break;
    default:
      chatbox.appendChild(createChatLi("Unknown action.", "incoming"));
      return;
  }

  // Show typing animation
  showTypingAnimation();

  setTimeout(() => { // Simulate a delay to fetch articles
    fetch(`http://localhost:3000${endpoint}`)
      .then(response => response.json())
      .then(articles => {
        hideTypingAnimation(); // Hide typing animation once the data is ready to load

        if (articles.length === 0) {
          chatbox.appendChild(createChatLi("There are no articles available for this selection.", "incoming"));
        } else {
          // Delay to show the typing animation again before displaying the intro message
          showTypingAnimation();
          setTimeout(() => {
            hideTypingAnimation();
            chatbox.appendChild(createChatLi(introMessage, "incoming"));
            scrollToBottomOfChat();

            // If the action is 'random', process only one article
            if (action === 'random' && articles.length > 0) {
              processArticles(articles, 0, chatbox);
            } else {
              // Start processing articles from the first one for 'latest' and 'important'
              processArticles(articles, 0, chatbox);
            }
            scrollToBottomOfChat();
          }, 500); // Delay to show intro message effectively
        }
      })
      .catch(error => {
        console.error('Error:', error);
        hideTypingAnimation();
        chatbox.appendChild(createChatLi("Sorry, there was an error fetching the articles.", "incoming"));
        scrollToBottomOfChat();
      });
  }, 0); // Adjusted delay to enhance the realistic interaction delay
};



function getArticleIdFromUrl() {
  const url = new URL(window.location.href);
  const pathname = url.pathname;

  if (pathname.includes('article.html')) {
    return url.searchParams.get('id');
  }

  return null;
}

  // Function to create article-specific buttons
  function createArticleButtons() {
    const articleId = getArticleIdFromUrl();
    const articleButtons = [
      { text: "Oppsummer artikkel", pattern: "summarize article" },
      { text: "Lignende artikler", pattern: "similar articles", id: articleId },
      { text: "Artikler i samme serie", pattern: "context", id: articleId },
      { text: "Bakgrunn kort forklart", pattern: "show backstory", id: articleId } // New button for backstory
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
      else if (btn.pattern === "similar articles") {
        button.onclick = () => {fetchSimilarArticles(btn.id)};
      }
      else if (btn.pattern === "context") {
        button.onclick = () => {fetchContextArticles(btn.id)};
      }
      else if (btn.pattern === "show backstory") {
        button.onclick = () => {summarizeBackstory(btn.id)};
      }
      button.setAttribute('data-pattern', btn.pattern);
      button.textContent = btn.text;
      buttonsContainer.appendChild(button);
    });

    return buttonsContainer;
  }
  
  function updateChatbotForArticle(articleId) {
    fetch(`http://localhost:3000/Articles/${articleId}`)
      .then(response => response.json())
      .then(article => {
        const chatbox = document.querySelector(".chatbox");
        chatbox.appendChild(createChatLi(`Article Title: ${article.title}`, "incoming"));
        chatbox.appendChild(createChatLi(`Article Author: ${article.author}`, "incoming"));
        chatbox.appendChild(createChatLi(`Article Content: ${article.content.substring(0, 300)}...`, "incoming"));
        scrollToBottomOfChat();
  
        // Fetch and display articles in the same series
        fetch(`http://localhost:3000/articlesInSeries/${articleId}`)
          .then(response => response.json())
          .then(seriesArticles => {
            seriesArticles.forEach((seriesArticle) => {
              chatbox.appendChild(createChatLi(`Backstory to the article title: ${seriesArticle.title}`, "incoming"));
              chatbox.appendChild(createChatLi(`Backstory to the article: ${seriesArticle.content.substring(0, 300)}...`, "incoming"));
              scrollToBottomOfChat();
            });
          })
          .catch(error => console.error('Error fetching series articles:', error));
      })
      .catch(error => console.error('Error fetching article:', error));
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
          scrollToBottomOfChat();
        }
      })
      .catch(error => {
        console.error('Error summarizing article:', error);
        const errorMessage = "Sorry, there was an error summarizing the article.";
        const errorLi = createChatLi(errorMessage, "incoming");
        const chatbox = document.querySelector(".chatbox");
        chatbox.appendChild(errorLi);
        scrollToBottomOfChat();
      }).finally(hideTypingAnimation);
  }

  function summarizeBackstory(articleId) {
    const chatbox = document.querySelector(".chatbox");
    showTypingAnimation(); // Start typing animation
  
    // Fetch all articles in the series
    fetch(`http://localhost:3000/articlesInSeries/${articleId}`)
      .then(response => response.json())
      .then(articles => {
        if (articles && articles.length > 0) {
          // Collect all articles content
          const contents = articles.map(article => article.content).join('\n\n');
          // Send the combined contents to the summarization endpoint
          return fetch('http://localhost:3000/summarizeMultipleArticlesBackstory', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ contents }), // Send the combined contents as JSON
          }).then(res => res.json());
        } else {
          throw new Error("Ingen relaterte artikler funnet.");
        }
      })
      .then(summaryData => {
        // Hide initial typing animation
        hideTypingAnimation();
  
        // Introductory message
        const introMessage = "Her er bakgrunnen til saken, kort forklart:😊";
        const introLi = createChatLi(introMessage, "incoming");
        chatbox.appendChild(introLi);
        scrollToBottomOfChat();
  
        // Show typing animation again for the summary
        showTypingAnimation();
  
        // Introduce a slight delay before displaying the summary
        setTimeout(() => {
          hideTypingAnimation(); // Hide typing animation before displaying summary
  
          // Display the combined summary
          const summaryLi = createChatLi(summaryData.summary, "incoming");
          chatbox.appendChild(summaryLi);
          scrollToBottomOfChat();
        }, 1000); // Delay can be adjusted as needed
  
      })
      .catch(error => {
        console.error('Error fetching or summarizing backstory articles:', error);
        hideTypingAnimation();
        const errorMessage = `Beklager, det oppstod en feil: ${error.message}`;
        const errorLi = createChatLi(errorMessage, "incoming");
        chatbox.appendChild(errorLi);
        scrollToBottomOfChat();
      });
  }

  function fetchCSButtons() {
    const chatbox = document.querySelector(".chatbox");
    const introMessage = "Her er kundeservicespørsmålene: 😊";
    chatbox.appendChild(createChatLi(introMessage, "incoming"));
    
    // Show typing animation initially for the intro message
    showTypingAnimation();
  
    // Introduce a slight delay before hiding the typing animation of the intro message
    setTimeout(() => {
      hideTypingAnimation(); // Hide typing animation for the intro message
  
      // Immediately show typing animation again for the buttons
      showTypingAnimation();
  
      setTimeout(() => {
        hideTypingAnimation(); // Hide typing animation before showing buttons
        const buttonsContainer = document.createElement('div');
        buttonsContainer.classList.add('faq-buttons-container');
  
        const csButtons = [
            { text: "Innlogging på våre digitale produkter", pattern: "digitalLogin" },
            { text: "Levering av papiravis", pattern: "paperDelivery" },
            { text: "Kjøp og endring av abonnement", pattern: "subscriptionManagement" },
            { text: "Betaling og faktura", pattern: "billingAndInvoices" },
        ];
  
        csButtons.forEach(btn => {
            const button = document.createElement('button');
            button.classList.add('faq-button', 'cs-button');
            button.textContent = btn.text;
            button.onclick = () => handleCSAction(btn.pattern);
            button.setAttribute('data-pattern', btn.pattern);
            buttonsContainer.appendChild(button);
        });
  
        // Append the buttons to the chatbox
        chatbox.appendChild(createChatLi(buttonsContainer, "incoming"));
        scrollToBottomOfChat();
      }, 500); // Delay before showing buttons to simulate typing
    }, 0); // Adjusted to transition immediately to second typing animation
  }
  
  
  function handleCSAction(pattern) {
    const chatbox = document.querySelector(".chatbox");
    showTypingAnimation(); // Start typing animation
  
    setTimeout(() => {
      hideTypingAnimation(); // Hide typing animation initially
      const categoryNames = {
        "digitalLogin": "Innlogging på våre digitale produkter",
        "subscriptionManagement": "Kjøp og endring av abonnement",
        "billingAndInvoices": "Betaling og faktura",
        "paperDelivery": "Levering av papiravis"
      };
  
      if (categoryNames[pattern]) {
        const categoryMessage = `Du valgte "${categoryNames[pattern]}" Trykk på knappene for å få svar på spørsmålet. 😊`;
        chatbox.appendChild(createChatLi(categoryMessage, "incoming"));
        scrollToBottomOfChat();
      }
  
      // Introduce a slight delay before showing options
      showTypingAnimation();
      setTimeout(() => {
        hideTypingAnimation(); // Hide typing animation before showing buttons
        const buttonsContainer = document.createElement('div');
        buttonsContainer.classList.add('faq-buttons-container');
        
        let options;
        if (pattern === "digitalLogin") {
          options = [
            { text: "Konto og innlogging", pattern: "accountAndLogin" },
            { text: "Tilgang og abonnement", pattern: "accessAndSubscription" },
            { text: "Tekniske problemer og assistanse", pattern: "technicalIssues" },
            { text: "Generelle spørsmål om tjenestene", pattern: "generalQuestions" }
          ];
        } else if (pattern === "subscriptionManagement") {
          options = [
            { text: "Abonnementstyper og priser?", answer: "Oversikt over alle abonnementstyper og priser finner du <a href=https://www.smp.no/dakapo/productpage/SPO>her.</a>"},
            { text: "Hva er inkludert i et abonnement?", answer: "Alle abonnenter får følgende inkludert i sitt abonnement: Tilgang til alle saker som ligger på nettavisen (Pluss-saker), eAvisen, den elektroniske versjonen av papiravisen, Digitalt arkiv, +Nyhetsbrev og fordelsbrev, Familiedeling (del din digitale tilgang med inntil 3 familiemedlemmer: Unntak: bedriftsabonnement og UNG). I tillegg får abonnenter som har Komplett- eller Helgeabonnement også papiravis." },
            { text: "Hvordan dele abonnement i familien?", answer: "Du kan dele abonnementet med inntil tre personer i familien (gjelder ikke bedriftsabonnement eller UNG-abonnement). Du kan velge hvem du gir tilgang til på <a href=https://minside.smp.no/familiedeling>Min Side.</a>" },
            { text: "Administrasjon av abonnementet?", answer: "Dette gjør du enkelt via <a href=https://minside.smp.no/>Min Side.</a>" },
            { text: "Kan jeg få bare papiravisen?", answer: "Nei, digital tilgang er inkludert i alle våre abonnement." },
            { text: "Digital tilgang med papiravisen?", answer: "Alle som abonnerer på papiravisen får automatisk tilgang til alt som publiseres på nett og mobil. Det eneste man må gjøre er å <a href=https://minside.smp.no/> opprette en Schibsted-konto, eller logge inn</a> hvis du har Schibsted-konto fra før."},
            { text: "Kjøpe en enkelt artikkel?", answer: "Nei, det er ikke mulig å kjøpe tilgang til/få tilsendt enkelt artikler." }
          ];              
        } else if (pattern === "billingAndInvoices") {
          options = [
            { text: "Betalingsrelaterte spørsmål", pattern: "betalingsspørsmål" },
            { text: "Abonnementshåndtering og endringer", pattern: "Abonnementshåndtering"},
          ];
        } else if (pattern === "paperDelivery") {
          options = [
            { text: "Stoppe papiravisen under reise?", answer: "Papiravisen stoppes enkelt på <a href=https://minside.smp.no/endre-avislevering>MinSide.</a> Du vil fortsatt ha tilgang til å lese eAvisen og plussartiklene på nettavisen." },
            { text: "Refusjon ved midlertidig stopp av papiravisen?", answer: "Nei. Selv om du stanser levering av papiravisen, har du fortsatt tilgang til eAvisen og nettavis. Du har derfor fortsatt tilgang til innholdet du har betalt for." },
            { text: "Leverandør av avisen?", answer: "Vår avis får du på hverdager levert med Polaris Distribusjon eller Posten. Hvis avisen skal leveres utenfor avisens region, brukes i noen tilfeller et lokalt distribusjonsselskap. Hvis det leveres avis på din adresse på lørdager, leveres lørdagsavisen med Polaris Distribusjon eller et lokalt distribusjonsselskap." },
            { text: "Forventet leveringstidspunkt for avisen?", answer: "Det varierer med leveringsmåte. Posten har leveransefrist kl. 17.00 på hverdager. Polaris Distribusjon har leveransefrist mellom kl. 06.30-09.00 på hverdager. Hvis det leveres avis på din adresse på lørdager, er leveransefristen kl. 17.00 Du finner informasjon angående levering på din adresse på Min Side. NB: Ved levering utenfor avisens region, vil Posten/det lokale distribusjonsselskapet kunne bruke 2-3 virkedager på leveransen. Leveringen har også forholdt relatert til den nye Postloven som trådte i kraft juli 2020." },
            { text: "Jeg er abonnent og har ikke fått papiravisen min. Kan jeg få den etterlevert eller godskrevet?", answer: "Vi har dessverre ikke mulighet til å etterlevere <a href=https://minside.smp.no/publication.epaperpage>Eavisen.</a> Eventuell godskriving skjer i henhold til <a href=https://minside.smp.no/vilkaar>gjeldende abonnementsvilkår</a>."},
            { text: "Manglende levering av papiravis?", answer: "Tilbakemelding på dagens avislevering kan gjøres <a href=https://minside.smp.no/tilbakemelding>her.</a>" }
          ];
        }

        if (options) {
          options.forEach(opt => {
            const button = document.createElement('button');
            button.classList.add('faq-button', 'sub-cs-button');
            button.textContent = opt.text;
            button.onclick = () => {
              showTypingAnimation();
              setTimeout(() => {
                if (opt.pattern === "accountAndLogin" || opt.pattern === "accessAndSubscription" || opt.pattern === "technicalIssues" || opt.pattern === "generalQuestions") {
                  handleDigitalLoginSubAction(opt.pattern);
                } else if (opt.pattern === "betalingsspørsmål" || opt.pattern === "Abonnementshåndtering") {
                  handleBillingAndInvoicesSubAction(opt.pattern);
                } else {
                  const answerMessage = `<strong>${opt.text}</strong><br>${opt.answer}`;
                  chatbox.appendChild(createChatLi(answerMessage, "incoming"));
                }
                hideTypingAnimation();
                scrollToBottomOfChat();
              }, 1500);
            };
            buttonsContainer.appendChild(button);
          });
        }
  
        chatbox.appendChild(createChatLi(buttonsContainer, "incoming"));
        scrollToBottomOfChat();
      }, 500); // Delay for processing the user's choice
    }, 1500); // Initial delay to mimic typing and processing
  }
  
  
  function handleDigitalLoginSubAction(pattern) {
    const chatbox = document.querySelector(".chatbox");
    const details = {
      "accountAndLogin": [
        { text: "Hva er en Schibsted-konto (tidligere SPiD)?", answer: "Vi benytter Schibsted-konto for å identifisere deg som kunde, mer informasjon om Schibsted finner du <a href=https://info.privacy.schibsted.com/no/hva-er-en-schibsted-konto/ target=_blank>her</a>." },
        { text: "Finner ikke denne kombinasjonen av e-post og passord", answer: "Dette betyr at passordet ditt er feil. Trykk 'Glemt passord?' der du logger inn, og følg instruksene for å lage et nytt passord." },
        { text: "Jeg har byttet e-postadresse, hva gjør jeg for å få digital tilgang med denne?", answer: "For å bytte e-postadresse på Schibsted-kontoen din må du endre selve <a href=https://payment.schibsted.no/account/summary?redirect_uri=https://www.smp.no>Schibsted-brukeren.</a>"}
      ],
      "accessAndSubscription": [
        { text: "Finner ikke abonnementet mitt?", answer: "Det kan være at du er logget inn med en annen e-postadresse enn den vi har registrert på abonnementet. Logg ut, og logg deretter inn med riktig e-postadresse." },
        { text: "Innlogget, men kan ikke lese eAvis/plussartikler?", answer: "Det kan være at du er logget inn med en annen e-postadresse enn den vi har registrert på abonnementet. Logg ut, og logg deretter inn med riktig e-postadresse." },
        { text: "Hva er Min Side?", answer: "På Min side kan du administrere ditt abonnement. Her kan du administrere alt fra omadressering til familiedeling. For å kunne benytte deg av min side, må du være innlogget med din Schibsted-bruker." },
        { text: "Hvorfor må jeg godkjenne vilkår?", answer: "Når du logger på for første gang, må du godkjenne våre og Schibsted sine brukervilkår og personvernserklæringer." },
      ],
      "technicalIssues": [
        { text: "Nedlastingen av eAvisen stopper, tips?", answer: "Dersom du opplever at nedlastingen av en utgave stanser opp, kan det skyldes flere årsaker. Du har ikke mer tilgjengelig lagringsplass for aviser på din enhet. Appen har en viss mengde tilegnet plass til lagring av aviser, og kan ikke bruke mer enn dette. Nederst i applikasjonen er det en knapp som heter 'Lagrede aviser'. Når du klikker på denne ser du de avisene som ligger lagret på din enhet, og de som det er påbegynt nedlasting av. Dersom du holder fingeren over en av disse utgavene får du valg om å slette utgaven. Prøv å slette et par gamle utgaver og start nedlastingen av dagens utgave på nytt." },
        { text: "Hvor er kundenummeret mitt?", answer: "Kundenummeret ditt står på fakturaen du får tilsendt fra oss, denne finner du bl.a. på Min Side." }
      ],
      "generalQuestions": [
        { text: "Krever eAvis Schibsted-konto?", answer: "Ja, for å lese eAvisa og plussartiklene på nettavisen må du ha en Schibsted-konto, samt et abonnement." },
        { text: "Hvor kan jeg lese eAvisen?", answer: "eAvisen kan leses på PC og Mac, samt alle smarttelefoner og nettbrett som har iOS (iPhone og iPad) og Android. Last ned vår eAvis-app kostnadsfritt fra App store eller Google play, eAvisen fungerer på alle enheter som kjører iOS (iPhone og iPad) eller Android." },
        { text: "Når er eAvisen tilgjengelig?", answer: "eAvisen er tilgjengelig senest kl 22:00 på alle plattformer." },
        { text: "Hvor finner jeg tidligere artikler?", answer: "Avisene tilbake til 2003 er tilgjengelig via digitalt abonnement. Gamle enkeltutgaver kan også kjøpes <a href=https://www.buyandread.com/>her.</a> I tillegg kan eldre aviser leses digitalt på de fleste bibliotek. Man kan også lese tidligere aviser på Nasjonalbiblioteket sin <a href=https://www.nb.no/search?mediatype=aviser>nettside.</a>" }
      ]
    };
    const categoryNames = {
      "accountAndLogin": "Konto og innlogging",
      "accessAndSubscription": "Tilgang og abonnement",
      "technicalIssues": "Tekniske problemer og assistanse",
      "generalQuestions": "Generelle spørsmål om tjenestene"
    };

    showTypingAnimation(); // Start typing animation
    setTimeout(() => {
      hideTypingAnimation(); // Hide typing animation
      const categoryMessage = `Du valgte "${categoryNames[pattern]}" Trykk på knappene for å få svar på spørsmålet. 😊`;
      chatbox.appendChild(createChatLi(categoryMessage, "incoming"));
      scrollToBottomOfChat();
  
      showTypingAnimation(); // Start typing animation for buttons
      setTimeout(() => {
        hideTypingAnimation(); // Hide typing animation before showing buttons
        const questions = details[pattern];
  
        if (questions) {
          const buttonsContainer = document.createElement('div');
          buttonsContainer.classList.add('faq-buttons-container');
  
          questions.forEach(question => {
            const button = document.createElement('button');
            button.classList.add('faq-button', 'sub-cs-button');
            button.textContent = question.text;
            button.onclick = () => {
              showTypingAnimation(); // Show typing for each button click
              setTimeout(() => {
                const answerMessage = `<strong>${question.text}</strong><br>${question.answer}`;
                chatbox.appendChild(createChatLi(answerMessage, "incoming"));
                hideTypingAnimation(); // Hide typing animation after showing answer
                scrollToBottomOfChat();
              }, 1500); // Delay to mimic typing for the answer
            };
            buttonsContainer.appendChild(button);
          });
  
          chatbox.appendChild(createChatLi(buttonsContainer, "incoming"));
          scrollToBottomOfChat();
        }
      }, 500); // Delay before showing buttons to simulate typing
    }, 0); // Initial delay to mimic typing and processing of category choice
  }

  function handleBillingAndInvoicesSubAction(pattern) {
    const chatbox = document.querySelector(".chatbox");
    const categoryNames = {
      "Abonnementshåndtering": "Abonnementshåndtering og endringer",
      "betalingsspørsmål": "Betalingsrelaterte spørsmål"
    };

  const details = {
  "betalingsspørsmål": [
    { text: "Kvittering for kortkjøp?", answer: "Kvitteringer for ditt kjøp finner du  <a href=https://payment.schibsted.no/account/purchasehistory/?redirect_uri=https://www.smp.no>her.</a>" },
    { text: "Feil beløp ved abonnementsbestilling?", answer: "Dersom dette skyldes feil fra vår side vil vi selvsagt rydde opp i situasjonen. Ta kontakt med vårt kundesenter: abonnement@smp.no, så hjelper vi deg." },
    { text: "Unngå fakturagebyr?", answer: "For å unngå fakturagebyr, anbefaler vi deg å opprette e-faktura eller avtalegiro i din nettbank. Alternativt kan kundeservice bistå med å få endret til e-postfaktura. Ved bestilling på nett kan du registrere ditt betalingskort og dette vil automatisk bli belastet, det påløper da ingen gebyrer." },
    { text: "Opprette eFaktura?", answer: "Avtalen må opprettes i mobilbank eller nettbank. Når du betaler en regning i nettbanken din, vil du få spørsmål om du vil inngå avtale om eFaktura fra betalingsmottakere som tilbyr dette. Du kan da enkelt takke ja til dette og opprette avtale. Fra 15. mai 2022 må du som eFakturakunde gi en generell aksept for eFaktura for å fortsette å være eFaktura-bruker. Dette omtales som 'Ja takk til alle' eller Alltid eFaktura, avhengig av hvilken bank eller betalingsapp du har. For å fortsatt kunne motta regninger og faktura som eFaktura, er det viktig at du aksepterer 'Ja takk til alle' i din nettbank eller betalingsapp. Dersom aksepten ikke gjennomføres før fristen, vil du ikke lenger motta eFaktura etter 15. mai 2022. Merk at allerede fra 1. desember 2021 må du gi generell aksept for eFaktura «Ja takk til alle» for å kunne motta regninger fra bedrifter som du tidligere ikke har mottatt eFaktura fra. Vi oppfordrer derfor alle som ønsker å benytte eFaktura om å inngå «Ja takk til alle»-avtale snarest mulig." },
    { text: "Betalingspåminnelse etter betalt faktura?", answer: "Din innbetaling og vår betalingspåminnelse kan ha krysset hverandre. Send oss en kvittering av innbetalingen via e-post så vi får sjekket at alt er i orden: abonnement@smp.no." },
    { text: "Hvorfor Polaris Media som betalingsmottaker?", answer: "Vi er en del av Polaris Media konsernet. Det betyr din innbetaling vil gå til Polaris Media, da det er de som fakturerer våre abonnement." }
  ],
  "Abonnementshåndtering": [
    { text: "Angrerett på digitalt kjøp?", answer: "I henhold til angrerettloven går angreretten tapt ved kjøp av digitale tjenester i det man med samtykke tar i bruk tjenesten. Du kan avslutte abonnementet <a href=https://minside.smp.no/avslutt>her.</a>" },
    { text: "Restgiro etter abonnementssigelse?", answer: "Dersom abonnementet ble sagt opp etter forfall, så vil du få en faktura for perioden mellom forfall og avslutning av abonnement." },
    { text: "Endre fakturaperiode?", answer: "Du kan endre fakturaperioden ved å ta kontakt med kundeservice. Alternativene vi har er 1-, 3- og 12-månedsfaktura." },
    { text: "Oppdatere betalingsinformasjon?", answer: "Betalingsmåte kan endres <a href=https://minside.smp.no/oppdaterkort>her.</a> "},
    { text: "Abonnement fornyet til redusert pris?", answer: "Alle våre abonnement er løpende til det blir sagt opp. Dersom man bestiller et abonnement til reduser pris og abonnementet ikke blir sagt opp, vil abonnementet løpe videre til ordinær pris." }
  ]
    };
  
  showTypingAnimation(); // Start typing animation for the category message
  setTimeout(() => {
    hideTypingAnimation(); // Hide typing animation
    const categoryMessage = `Du valgte "${categoryNames[pattern]}" Trykk på knappene for å få svar på spørsmålet. 😊`;
    chatbox.appendChild(createChatLi(categoryMessage, "incoming"));
    scrollToBottomOfChat();

    showTypingAnimation(); // Start typing animation for buttons
    setTimeout(() => {
      hideTypingAnimation(); // Hide typing animation before showing buttons
      const questions = details[pattern];

      if (questions) {
        const buttonsContainer = document.createElement('div');
        buttonsContainer.classList.add('faq-buttons-container');

        questions.forEach(question => {
          const button = document.createElement('button');
          button.classList.add('faq-button', 'sub-cs-button');
          button.textContent = question.text;
          button.onclick = () => {
            showTypingAnimation(); // Show typing for each button click
            setTimeout(() => {
              const answerMessage = `<strong>${question.text}</strong><br>${question.answer}`;
              chatbox.appendChild(createChatLi(answerMessage, "incoming"));
              hideTypingAnimation(); // Hide typing animation after showing answer
              scrollToBottomOfChat();
            }, 1500); // Delay to mimic typing for the answer
          };
          buttonsContainer.appendChild(button);
        });

        chatbox.appendChild(createChatLi(buttonsContainer, "incoming"));
        scrollToBottomOfChat();
      } else {
        const message = "There are no specific questions available for this category.";
        chatbox.appendChild(createChatLi(message, "incoming"));
      }
    }, 500); // Delay before showing buttons to simulate typing
  }, 0); // Initial delay to mimic typing and processing of category choice
}
  
  function handleQuestionResponse(questionText, answer) {
    const chatbox = document.querySelector(".chatbox");
    const message = `<strong>Question:</strong> ${questionText}<br><strong>Answer:</strong> ${answer}`; // Displaying question and answer
    chatbox.appendChild(createChatLi(message, "incoming"));
    scrollToBottomOfChat();
  }

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
    : "Hei! Jeg er Sunnmørspostens Chatbot! 😊";

  chatbox.appendChild(createChatLi(greetingMessage, "incoming"));
  scrollToBottomOfChat();

  // Start the thinking animation again before showing the follow-up message
  showTypingAnimation();

  setTimeout(() => {
    hideTypingAnimation();  // Hide the typing animation after a delay

    const clickButtonMessage = articleId
      ? "Tips: Bruk pila øverst til venstre for å scrolle tilbake til knappene."
      : "Tips: Bruk pila øverst til venstre for å scrolle tilbake til knappene.";

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