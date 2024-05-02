
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