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

//const articlesData = JSON.parse(fs.readFileSync(path.join(__dirname, 'sample_articles.json'), 'utf8'));
//const categories = Object.keys(articlesData);
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
    const articlesList = await fetchRelevantArticles(); // Fetch relevant articles
    return articlesList;
  } else if (cancelSubscriptionRegex.test(userInput)) {
    const youthArticlesList = await fetchYouthArticles(); // Fetch articles for "Ungdom"
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
          // Join the article titles with two newlines for spacing
          return data.map(article => `- ${article.title}`).join('\<br><br>');
      } else {
          return "Det er for tiden ingen relevante artikler å vise.";
      }
  } catch (error) {
      console.error('Error fetching articles:', error);
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
          return data.map(article => `- ${article.title}`).join('<br><br>');
      } else {
          return "Det er for tiden ingen artikler for Ungdom å vise.";
      }
  } catch (error) {
      console.error('Error fetching youth articles:', error);
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

// Endpoint to get an article by ID from Supabase
app.get('/articles/:id', async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase
    .from('Articles')
    .select('title, author, content, category')
    .eq('id', id)
    .single(); // assuming 'id' is a unique column and you're expecting only one result

  if (error) {
    console.error('Error fetching article:', error);
    return res.status(500).send('Error fetching article');
  }

  if (data) {
    res.json(data);
  } else {
    res.status(404).send('Article not found');
  }
});

// Endpoint to get articles by category from Supabase
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
    console.error('Error fetching important articles:', error);
    return res.status(500).send('Error fetching important articles');
  }

  res.json(data);
});

app.get('/Articles/:category/random', async (req, res) => {
  const { category } = req.params;
  try {
    let { data, error } = await supabase
      .rpc('random_article', { cat: category })

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Error fetching random article:', error);
    res.status(500).send('Error fetching random article');
  }
});

const searchArticlesInDatabase = async (searchTerms) => {
  const keywords = searchTerms.split(' '); // Split the searchTerms string into an array of keywords
  console.log("Split search terms into keywords:", keywords);

  try {
    let query = supabase
      .from('Articles')
      .select('id, title, author, content, category, publication_date, url');
    
    // Dynamically add 'ilike' filters for each keyword
    keywords.forEach(keyword => {
      // Add or conditions for title, content, and category for each keyword
      query = query.or(`title.ilike.%${keyword}%,content.ilike.%${keyword}%,category.ilike.%${keyword}%`);
    });

    // Execute the query
    let { data: Articles, error } = await query;

    if (error) {
      console.error('Error searching Articles:', error);
      return [];
    }

    if (Articles.length > 0) {
      console.log(`${Articles.length} Articles found.`);
    } else {
      console.log('No Articles found with the given search terms.');
    }

    return Articles;
  } catch (error) {
    console.error('Unhandled error searching Articles:', error);
    return [];
  }
};



// Endpoint to process questions
app.post('/ask', async (req, res) => {
  const userInput = req.body.message;
  // First, check if the user is asking for something that can be answered by FAQs
  let responseText = await checkSubscriptionFAQs(userInput);
  // Add user's input to chat history
  chatHistory.push({ role: 'user', content: userInput });

  if (!responseText) {
    // Attempt to find articles relevant to the user's input
    const Articles = await searchArticlesInDatabase(userInput);
    console.log('Articles:', Articles);
    // If articles are found, format them into a response
    if (Articles.length > 0) {
      console.log('Hadde vært gøy med artikkler', Articles);
      responseText = Articles.map(Article => 
        `Title: ${Article.title}, Author: ${Article.author}, Summary: ${Article.content.substring(0, 150)}...` // Summarize the content
      ).join('\n');
    } else {
      // If no articles are found, ask OpenAI for an appropriate response
      try {
        console.log('Ingen artikkler her nei', Articles);
        const openAIResponse = await openai.createChatCompletion({
          model: 'gpt-4-0125-preview',
          messages: chatHistory,
          max_tokens: 300,
        });
        responseText = openAIResponse.data.choices[0].message.content?.trim();
        // Add OpenAI's response to chat history
        chatHistory.push({ role: 'assistant', content: responseText });
      } catch (error) {
        console.error("Error with OpenAI:", error);
        responseText = "Sorry, I encountered an error processing your request.";
      }
    }
  }

  // Send the response back to the user
  res.json({ response: responseText });
});

app.get("", (req, res) => {
  res.sendFile(path.join(__dirname, '/index.html'));
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});