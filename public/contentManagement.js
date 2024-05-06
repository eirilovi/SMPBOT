import { formatArticleMessage } from "./utils.js";
import { showTypingAnimation } from "./chatInteractions.js";
import { hideTypingAnimation } from "./chatInteractions.js";
import { createChatLi } from "./chatInteractions.js";
import { scrollToBottomOfChat } from "./utils.js";
import { generateResponse } from "./messageProcessing.js";
import { runArticle } from "./apiHandlers.js";
import { fetchSimilarArticles } from "./apiHandlers.js";
import { fetchContextArticles } from "./apiHandlers.js";
import { summarizeBackstory } from "./apiHandlers.js";

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

  // Function to create article-specific buttons
  function createArticleButtons() {
    const articleId = getArticleIdFromUrl();
    const articleButtons = [
      { text: "Oppsummer artikkel", pattern: "summarize article" },
      { text: "Bakgrunn kort forklart", pattern: "show backstory", id: articleId },
      { text: "Artikler i samme serie", pattern: "context", id: articleId },
      { text: "Lignende artikler", pattern: "similar articles", id: articleId }
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

  function getArticleIdFromUrl() {
    const url = new URL(window.location.href);
    const pathname = url.pathname;
  
    if (pathname.includes('article.html')) {
      return url.searchParams.get('id');
    }
  
    return null;
  }

export {
  processArticles,
  createFaqButtons,
  createArticleButtons,
  updateChatbotForArticle,
  getArticleIdFromUrl,
}