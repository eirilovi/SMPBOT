import { showTypingAnimation } from './chatInteractions.js'
import { hideTypingAnimation } from './chatInteractions.js'
import { scrollToBottomOfChat } from './utils.js'
import { fetchAndDisplayCategories } from './apiHandlers.js'
import { createChatLi } from './chatInteractions.js'
import { fetchCSButtons } from './csFaqManagement.js'
import { processArticles } from './contentManagement.js'
import { formatArticleMessage } from './utils.js'


let selectedCategory = null;

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

export {
  generateResponse,
}