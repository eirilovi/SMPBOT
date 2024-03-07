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
let chatHistory = []; // Store the chat history

// Function to check FAQs
function checkSubscriptionFAQs(userInput) {
  const subscribeRegex = /how.*subscribe/i;
  const plansRegex = /subscription.*plans/i;
  const cancelSubscriptionRegex = /cancel.*subscription/i;
  const accessContentRegex = /can.*access.*subscriber.*content/i;

  if (subscribeRegex.test(userInput)) {
    return "Press '+Få tilgang' in the top right corner of the menu-bar...";
  } else if (plansRegex.test(userInput)) {
    return "The subscription plans available are Digital, Complete, Young (Under 34), and Weekend papers + Digital.";
  } else if (cancelSubscriptionRegex.test(userInput)) {
    return "To cancel your subscription, please visit https://minside.smp.no/endre-abonnement and select 'Stopp abonnement'.";
  } else if (accessContentRegex.test(userInput)) {
    return "If you can't access subscriber-only content, it may mean you don't have an active subscription...";
  }
  return ""; // Return an empty string if no FAQ matches
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

//Endpoint to get articles by tags from Supabase
app.get('/Articles/:tags', async (req, res) => {
  const { tags } = req.params;
  const { data, error } = await supabase
    .from('Articles')
    .select('*')
    .eq('tags', tags);

  if (error) {
    console.error(error);
    return res.status(500).send('Error fetching Articles');
  }

  res.json(data);
});


// Endpoint to process questions
app.post('/ask', async (req, res) => {
  const userInput = req.body.message;
  let responseText = checkSubscriptionFAQs(userInput); // Check FAQs first

  // Add user's input to chat history
  chatHistory.push({ role: 'user', content: userInput });

  if (!responseText) { // If not an FAQ, proceed with OpenAI
    try {
      const openAIResponse = await openai.createChatCompletion({
        model: 'gpt-3.5-turbo',
        messages: chatHistory,
        max_tokens: 500,
      });
      responseText = openAIResponse.data.choices[0].message.content?.trim();
      // Add OpenAI's response to chat history
      chatHistory.push({ role: 'assistant', content: responseText });
    } catch (error) {
      console.error("Error with OpenAI:", error);
      responseText = "Sorry, I encountered an error processing your request.";
    }
  }

  res.json({ response: responseText }); // Send the response
});

// Reset chat history
app.post('/reset', (req, res) => {
  chatHistory = []; // Clear the chat history
  res.send('Chat history has been reset.');
});

app.get("", (req, res) => {
  res.sendFile(path.join(__dirname, '/index.html'));
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});