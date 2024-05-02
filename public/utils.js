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
  
  function scrollToBottomOfChat() {
    const chatbox = document.querySelector(".chatbox");
    smoothScrollToBottom(chatbox);
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

document.addEventListener('DOMContentLoaded', function() {
    document.addEventListener('scroll', function() {
        const scrollComponent = document.querySelector(".chatbox");
        let scrollToTopBtn = document.getElementById('scrollToTopBtn');
      
        if (scrollComponent && scrollComponent.scrollTop > 100) {
            scrollToTopBtn.style.display = "block";
        } else {
            scrollToTopBtn.style.display = "none";
        }
    });
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