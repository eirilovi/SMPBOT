import express from 'express';
import bodyParser from 'body-parser';
import fs from 'fs';
import openai from './config/open-ai.js';
import cors from 'cors';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const app = express();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const port = 3000;

app.use(bodyParser.json()); // for parsing application/json
app.use(cors()); // Enable CORS for all origins
app.use(express.static("public")); // Serve static files

//const ArticlesData = JSON.parse(fs.readFileSync(path.join(__dirname, 'sample_Articles.json'), 'utf8'));
//const categories = Object.keys(ArticlesData);
let chatHistory = [
  { role: 'system', content: 'You are a friendly chatbot helper. You will answer the users question and then recommend that the user should utilize the buttons above, as they are very helpful. you will only communicate in "new norwegian, nynorsk"'}
];; // Store the chat history

// Function to check FAQs
async function checkSubscriptionFAQs(userInput) {
  const subscribeRegex = /bli *abonnent/i;
  const plansRegex = /relevante *artikler/i;
  const cancelSubscriptionRegex = /artikler *ungdom/i;
  const accessContentRegex = /hvilke *kategorier/i;

  if (subscribeRegex.test(userInput)) {
    return 'Om du ønsker å bli abonnent, følg denne lenken: <a href="https://www.smp.no/dakapo/productpage/SPO/?source=topheader_A" target="_blank">Trykk her</a>';
  } else if (plansRegex.test(userInput)) {
    const ArticlesList = await fetchRelevantArticles(); // Fetch relevant Articles
    return ArticlesList;
  } else if (cancelSubscriptionRegex.test(userInput)) {
    const youthArticlesList = await fetchYouthArticles(); // Fetch Articles for "Ungdom"
    return youthArticlesList;
  } else if (accessContentRegex.test(userInput)) {
    return 'Du kan kontakte oss her: <a href="https://www.smp.no/nyheter/i/oWbOOB/kontakt-oss" target="_blank">Trykk her</a>';
  }
  return ""; // Return an empty string if no FAQ matches
}

async function fetchRelevantArticles() {
  try {
      const { data, error } = await supabase
          .from('Articles')
          .select('title, url') // Select both title and url from your Articles table
          .limit(5);

      if (error) {
          throw error;
      }

      if (data && data.length > 0) {
          // Create hyperlinks for each article
          return data.map(article => `<a href="${article.url}" target="_blank">${article.title}</a>`).join('<br><br>');
      } else {
          return "Det er for tiden ingen relevante artikler å vise.";
      }
  } catch (error) {
      console.error('Error fetching Articles:', error);
      return "Det oppsto en feil under henting av artikler.";
  }
}


async function fetchYouthArticles() {
  try {
      const { data, error } = await supabase
          .from('Articles')
          .select('*')
          .ilike('tags', '%Ungdom%')
          .limit(5);

      if (error) {
          throw error;
      }

      if (data && data.length > 0) {
        return data.map(article => `<a href="${article.url}" target="_blank">${article.title}</a>`).join('<br><br>');
      } else {
          return "Det er for tiden ingen artikler for Ungdom å vise.";
      }
  } catch (error) {
      console.error('Error fetching youth Articles:', error);
      return "Det oppsto en feil under henting av artikler for Ungdom.";
  }
}

app.get('/categories', async (req, res) => {
  const { data, error } = await supabase
    .from('Articles') // Matches the table name in Supabase
    .select('category'); // Matches the column name in Supabase

  if (error) {
    console.error('Error fetching categories:', error);
    return res.status(500).send('Error fetching categories');
  }

  // Log raw data for debugging
  console.log('Raw data:', data);

  // Extract and filter unique categories
  const categories = Array.from(new Set(data.map(item => item.category))).filter(Boolean);

  // Log categories for debugging
  console.log('Categories:', categories);

  res.json(categories);
});

// Endpoint to get an Article by ID from Supabase
app.get('/Articles/:id', async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase
    .from('Articles')
    .select('title, author, content, category')
    .eq('id', id)
    .single(); // assuming 'id' is a unique column and you're expecting only one result

  if (error) {
    console.error('Error fetching Article:', error);
    return res.status(500).send('Error fetching Article');
  }

  if (data) {
    // Update chat history with article's title, author, and content
    chatHistory.push({ 
      role: 'system', 
      content: `Article Title: ${data.title}` 
    });
    chatHistory.push({ 
      role: 'system', 
      content: `Article Author: ${data.author}`
    });
    chatHistory.push({ 
      role: 'system', 
      content: `Article Content: ${data.content.substring(0, 300)}...` // Limit the content size
    });

    res.json(data);
  } else {
    res.status(404).send('Article not found');
  }
});



// Endpoint to get Articles by category from Supabase
app.get('/Articles/:category', async (req, res) => {
  const { category } = req.params;
  const { data, error } = await supabase
    .from('Articles')
    .select('*')
    .eq('category', category);

  if (error) {
    console.error(error);
    return res.status(500).send('Error fetching Articles');
  }

  res.json(data);
});


// This function will send JSON responses with titles and URLs
const sendArticlesAsJson = (res, data) => {
  const articlesWithLinks = data.map(article => {
    return { title: article.title, url: article.url };
  });
  res.json(articlesWithLinks); // Send a JSON response
};

app.get('/Articles/:category/latest', async (req, res) => {
  const { category } = req.params;
  const { data, error } = await supabase
    .from('Articles')
    .select('title, url')
    .eq('category', category)
    .order('publication_date', { ascending: false })
    .limit(3);

  if (error) {
    console.error(error);
    return res.status(500).send('Error fetching latest Articles');
  }

  sendArticlesAsJson(res, data);
});


app.get('/Articles/:category/important', async (req, res) => {
  const { category } = req.params;
  const { data, error } = await supabase
    .from('Articles')
    .select('title, url')
    .eq('category', category)
    .order('viktighetsgrad', { ascending: false })
    .limit(3);

  if (error) {
    console.error('Error fetching important Articles:', error);
    return res.status(500).send('Error fetching important Articles');
  }

  const articlesAsJson = data.map(article => {
    return { title: article.title, url: article.url };
  });

  res.json(articlesAsJson);
});


app.get('/Articles/:category/random', async (req, res) => {
  const { category } = req.params;
  try {
    const { data, error } = await supabase
      .rpc('random_article', { cat: category })
      .limit(1); // Assuming the RPC returns a single random article, adjust if it's different.

    if (error) {
      throw error;
    }

    const articlesAsJson = data.map(article => {
      return { title: article.title, url: article.url };
    });

    res.json(articlesAsJson);
  } catch (error) {
    console.error('Error fetching random Article:', error);
    res.status(500).send('Error fetching random Article');
  }
});

const extractKeywords = (userInput) => {
  // Define a list of key phrases or words to look for
  const keyPhrases = ['artificial intelligence', 'machine learning', 'climate change', 'flowers']; // Add more as needed
  let keywords = [];

  // Convert to lowercase for case-insensitive matching
  const inputLower = userInput.toLowerCase();

  // Check if user input includes any key phrases
  keyPhrases.forEach(phrase => {
    if (inputLower.includes(phrase)) {
      keywords.push(phrase);
    }
  });

  return keywords;
};

const searchArticlesInDatabase = async (keywords) => {
  let ArticlesFound = [];

  // Assuming each keyword represents a separate search criterion
  for (let keyword of keywords) {
    let { data: Articles, error } = await supabase
      .from('Articles')
      .select('id, title, author, content, category, publication_date, url, tags')
      .ilike('tags', `%${keyword}%`); // Adjust as needed for your schema

    if (error) {
      console.error('Error searching Articles by keywords:', error);
      continue; // Proceed to the next keyword on error
    }

    // Append found Articles, avoiding duplicates
    Articles.forEach(Article => {
      if (!ArticlesFound.find(a => a.id === Article.id)) {
        ArticlesFound.push(Article);
      }
    });
  }

  console.log(ArticlesFound.length > 0 ? `${ArticlesFound.length} Articles found.` : 'No Articles found based on keywords.');
  return ArticlesFound;
};

app.post('/ask', async (req, res) => {
  const userInput = req.body.message;
  
  // Update chat history with user's message
  chatHistory.push({ role: 'user', content: userInput });

  // First, check if the user is asking for something that can be answered by FAQs
  let faqResponse = await checkSubscriptionFAQs(userInput);
  
  let response = [];

  if (faqResponse) {
    // FAQ response found, append it to the response array and update chat history
    response.push({ type: 'text', content: faqResponse });
    chatHistory.push({ role: 'system', content: faqResponse });
  } else {
    // No FAQ match, extract keywords from the user input
    const keywords = extractKeywords(userInput);
    
    if (keywords.length > 0) {
      const articles = await searchArticlesInDatabase(keywords);
      
      if (articles.length > 0) {
        // Found relevant articles, prepare each article as an individual response
        articles.forEach(article => {
          response.push({
            type: 'article',
            title: article.title,
            author: article.author,
            summary: article.content.substring(0, 150) + '...',
            url: article.url // Assuming you have a URL for the article
          });
          chatHistory.push({ role: 'system', content: article.title });
        });
      } else {
        // No articles found, ask OpenAI
        await askOpenAIForResponse(userInput);
      }
    } else {
      // No keywords found, ask OpenAI
      await askOpenAIForResponse(userInput);
    }
  }

  // Send the response array back
  res.json({ response });

  async function askOpenAIForResponse(userInput) {
    try {
      const openAIResponse = await openai.createChatCompletion({
        model: 'gpt-3.5-turbo',
        messages: chatHistory,
        max_tokens: 300,
      });
      let responseText = openAIResponse.data.choices[0].message.content.trim();
      // Prepare OpenAI's response to send back
      response.push({ type: 'text', content: responseText });
      chatHistory.push({ role: 'system', content: responseText });
    } catch (error) {
      console.error("Error with OpenAI:", error);
      let errorMessage = "Sorry, I encountered an error processing your request.";
      response.push({ type: 'text', content: errorMessage });
      chatHistory.push({ role: 'system', content: errorMessage });
    }
  }
});

// Endpoint to summarize an article
app.get('/summarizeArticle/:id', async (req, res) => {
  const { id } = req.params;

  // Fetch the article content from Supabase
  const { data: article, error } = await supabase
    .from('Articles')
    .select('content')
    .eq('id', id)
    .single();

  if (error || !article) {
    return res.status(500).send('Error fetching article or article not found');
  }

  // Prepare prompt for GPT-3-turbo
  const prompt = 
  
  `Write an ULTRA-SHORT summary in norwegian about this article in THREE bullet points that are spaced out with paragraphs: \n\n${article.content}`;

  try {
    const openAIResponse = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [{role: 'system', content: prompt}],
      max_tokens: 300,
    });

    const summary = openAIResponse.data.choices[0].message.content.trim();
    res.json({ summary });
  } catch (error) {
    console.error("Error with OpenAI:", error);
    res.status(500).send('Error summarizing article');
  }
});

// Endpoint to get similar articles by tags
app.get('/similarArticles/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // Fetch the tags for the current article
    const { data: currentArticle, error: currentArticleError } = await supabase
      .from('Articles')
      .select('tags')
      .eq('id', id)
      .single();

    if (currentArticleError) throw currentArticleError;
    
    // Assuming the tags are stored as a comma-separated string
    const tags = currentArticle.tags.split(',');

    // Now fetch articles that share these tags, excluding the current article
    const { data: similarArticles, error: similarArticlesError } = await supabase
      .from('Articles')
      .select('id, title, url')
      .in('tags', tags)
      .not('id', 'eq', id) // Exclude the current article
      .limit(5); // Limit to 5 similar articles

    if (similarArticlesError) throw similarArticlesError;
    
    res.json(similarArticles);
  } catch (error) {
    console.error('Error fetching similar articles:', error);
    res.status(500).send('Error fetching similar articles');
  }
});


app.get("", (req, res) => {
  res.sendFile(path.join(__dirname, '/index.html'));
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});