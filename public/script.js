//import { initializeChatbot } from './initUI.js';
import './csFaqManagement.js';
import './chatInteractions.js';
import './apiHandlers.js';
import './contentManagement.js';
import './messageProcessing.js';
import './utils.js';

document.addEventListener('DOMContentLoaded', function() {
 // initializeChatbot();
  setupEventListeners();
});

function setupEventListeners() {
  document.getElementById('scrollToTopBtn').addEventListener('click', function() {
      const scrollComponent = document.querySelector(".chatbox");
      scrollComponent.scrollTo({
          top: 0,
          behavior: "smooth"
      });
  });
}