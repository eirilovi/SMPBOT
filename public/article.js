document.addEventListener('DOMContentLoaded', () => {
  // Extract the article ID from the URL
  const urlParams = new URLSearchParams(window.location.search);
  const articleId = urlParams.get('id'); // Assuming the URL parameter is 'id'

  // Fetch the article from your backend
  fetch(`http://localhost:3000/articles/${articleId}`)
    .then(response => response.json())
    .then(article => {
        if (!article || article.error) {
            console.error('Article not found or error fetching article:', article.error);
            return;
        }
        
        // Make sure you replace these selectors with those you actually have in your article.html
        document.getElementById('article-title').textContent = article.title;
        document.getElementById('article-author').textContent = article.author;
        document.getElementById('article-content').textContent = article.content;
        document.getElementById('article-category').textContent = article.category;
        // Optionally add the publication date if you have a placeholder for it
        // document.getElementById('article-publication-date').textContent = new Date(article.publication_date).toLocaleDateString();
    })
    .catch(error => console.error('Error fetching article:', error));
});
