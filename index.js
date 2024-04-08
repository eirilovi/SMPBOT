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
  { role: 'system', content: 'You are an AI chatbot created for sunnmørsposten, a norwegian news channel. You WILL NOT answer any questions that a news based bot would not answer. This includes but is not related to: "Medical help, jokes, silly stuff, geography, cooking". If you receive an inappropriate prompt, you will let the user know that you only provide answers based on news, or nagivating the sunnmørsposten website. You will only communicate in "Nynorsk", also known as New Norwegian' }
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
          .select('title')
          .limit(5);

      if (error) {
          throw error;
      }

      if (data && data.length > 0) {
          // Join the Article titles with two newlines for spacing
          return data.map(Article => `- ${Article.title}`).join('\<br><br>');
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
          .select('title')
          .ilike('tags', '%Ungdom%')
          .limit(5);

      if (error) {
          throw error;
      }

      if (data && data.length > 0) {
          return data.map(Article => `- ${Article.title}`).join('<br><br>');
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


app.get('/Articles/:category/latest', async (req, res) => {
  const { category } = req.params;
  const { data, error } = await supabase
    .from('Articles')
    .select('*')
    .eq('category', category)
    .order('publication_date', { ascending: false })
    .limit(3);

  if (error) {
    console.error(error);
    return res.status(500).send('Error fetching latest Articles');
  }

  res.json(data);
});

app.get('/Articles/:category/important', async (req, res) => {
  const { category } = req.params;
  const { data, error } = await supabase
    .from('Articles')
    .select('*')
    .eq('category', category)
    .order('viktighetsgrad', { ascending: false })
    .limit(3);

  if (error) {
    console.error('Error fetching important Articles:', error);
    return res.status(500).send('Error fetching important Articles');
  }

  res.json(data);
});

app.get('/Articles/:category/random', async (req, res) => {
  const { category } = req.params;
  try {
    let { data, error } = await supabase
      .rpc('random_Article', { cat: category })

    if (error) throw error;

    res.json(data);
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
  let response = [];
  
  // First, check if the user is asking for something that can be answered by FAQs
  let responseText = await checkSubscriptionFAQs(userInput);
  
  if (responseText) {
    // FAQ response found, prepare it to send back
    response.push({ type: 'text', content: responseText });
  } else {
    // No FAQ match, extract keywords from the user input
    const keywords = extractKeywords(userInput);
    
    // Proceed if keywords are extracted; otherwise, ask OpenAI directly
    if (keywords.length > 0) {
      const articles = await searchArticlesInDatabase(keywords);
      
      if (articles.length > 0) {
        // Prepare each article as an individual response
        articles.forEach(article => {
          response.push({
            type: 'article',
            title: article.title,
            author: article.author,
            summary: article.content.substring(0, 150) + '...',
            url: article.url // Assuming you have a URL for the article
          });
        });
      } else {
        // No articles found, prepare to ask OpenAI
        await askOpenAIForResponse();
      }
    } else {
      // No keywords found, prepare to ask OpenAI
      await askOpenAIForResponse();
    }
  }

  // Send the array of responses back
  res.json({ response });

  async function askOpenAIForResponse() {
    try {
      const openAIResponse = await openai.createChatCompletion({
        model: 'gpt-4-0125-preview',
        messages: [{role: "user", content: userInput}], // Adjust based on how you're structuring chat history
        messages: chatHistory,
        max_tokens: 300,
      });
      responseText = openAIResponse.data.choices[0].message.content.trim();
      // Prepare OpenAI's response to send back
      response.push({ type: 'text', content: responseText });
    } catch (error) {
      console.error("Error with OpenAI:", error);
      response.push({ type: 'text', content: "Sorry, I encountered an error processing your request." });
    }
  }
});


app.get("", (req, res) => {
  res.sendFile(path.join(__dirname, '/index.html'));
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});