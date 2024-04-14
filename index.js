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
  { role: 'system', content: 'You are a friendly chatbot helper. You will answer the users question and then recommend that the user should utilize the buttons above, as they are very helpful. you will only communicate in "bokmål", norwegian'}
];; // Store the chat history

// Function to check FAQs
async function checkSubscriptionFAQs(userInput) {
  const subscribeRegex = /bli *abonnent/i;
  const plansRegex = /relevante *artikler/i;
  const cancelSubscriptionRegex = /artikler *ungdom/i;
  const accessContentRegex = /hvilke *kategorier/i;

  if (subscribeRegex.test(userInput)) {
    return 'Om du ønsker å bli abonnent, følg denne lenken: <a href="https://www.smp.no/dakapo/productpage/SPO/?source=topheader_A" target="_blank">Trykk her</a>';
  } else if (accessContentRegex.test(userInput)) {
    return 'Du kan kontakte oss her: <a href="https://www.smp.no/nyheter/i/oWbOOB/kontakt-oss" target="_blank">Trykk her</a>';
  }
  return ""; // Return an empty string if no FAQ matches
}

app.get('/relevantArticles', async (req, res) => {
  try {
    // Fetch the top 20 most recent articles
    const { data: recentArticles, error: recentError } = await supabase
        .from('Articles')
        .select('id, title, url, viktighetsgrad')
        .order('publication_date', { ascending: false })
        .limit(20);

    if (recentError) {
        console.error('Error fetching Articles:', recentError);
        return res.status(500).send('Error fetching Articles');
    }

    // Filter to the top 5 based on importance
    if (recentArticles && recentArticles.length > 0) {
        const topArticles = recentArticles
            .sort((a, b) => b.viktighetsgrad - a.viktighetsgrad) // Sort by 'viktighetsgrad' descending
            .slice(0, 3); // Take the top 3

        // Return articles as JSON
        res.json({
            message: "Dette er de siste og mest relevante artiklene for i dag: 😊",
            articles: topArticles
        });
    } else {
        res.status(404).send("Det er for tiden ingen relevante artikler å vise.");
    }
  } catch (error) {
    console.error('Error fetching relevant Articles:', error);
    res.status(500).send("Det oppsto en feil under henting av artikler.");
  }
});

// Endpoint to get Articles specifically tagged with "Ungdom"
app.get('/articlesUngdom', async (req, res) => {
  const tag = 'Ungdom'; // Hardcoded tag value
  const { data, error } = await supabase
    .from('Articles')
    .select('*')
    .ilike('tags', `%${tag}%`);

  if (error) {
    console.error('Error fetching Articles tagged with Ungdom:', error);
    return res.status(500).send('Error fetching Articles');
  }

  if (data.length === 0) {
    return res.status(404).send('No articles found with the tag Ungdom');
  }

  res.json(data);
});


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
  
  `Write an ULTRA-SHORT summary in norwegian about this article in ONLY THREE bullet points that are SEPERATED WITH PARAGRAPHS: \n\n${article.content}`;

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

app.get('/articlesInSeries/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // Fetch the series information for the current article
    const { data: articleData, error: articleError } = await supabase
      .from('Articles')
      .select('series')
      .eq('id', id)
      .single();

    if (articleError) {
      throw articleError;
    }

    // Parse the series data assuming it might be comma-separated
    const seriesIds = articleData.series.split(',').map(s => s.trim());

    // Fetch all articles from the same series
    const { data: seriesArticles, error: seriesError } = await supabase
      .from('Articles')
      .select('id, title, url')
      .in('series', seriesIds)
      .not('id', 'eq', id); // Optionally exclude the current article from the list

    if (seriesError) {
      throw seriesError;
    }

    res.json(seriesArticles);
  } catch (error) {
    console.error('Error fetching articles in series:', error);
    res.status(500).send('Error fetching articles in series');
  }
});

app.get('/similarArticles/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // Fetch the tags for the current article
    const { data: currentArticle, error: currentArticleError } = await supabase
      .from('Articles')
      .select('tags')
      .eq('id', id)
      .single();

    if (currentArticleError) {
      console.error('Error fetching article tags:', currentArticleError);
      throw currentArticleError;
    }

    // Split tags and remove extra spaces
    const tags = currentArticle.tags.split(',').map(tag => tag.trim());
    let articlesFound = new Map();

    for (let tag of tags) {
      const { data: articlesByTag, error: tagError } = await supabase
        .from('Articles')
        .select('id, title, url')
        .ilike('tags', `%${tag}%`) // Use ILIKE for case-insensitive matching
        .not('id', 'eq', id); // Exclude the current article

      if (tagError) {
        console.error('Error fetching articles by tag:', tagError);
        continue; // Skip to the next tag on error
      }

      // Add or update the count of matching tags for each article
      articlesByTag.forEach(article => {
        if (!articlesFound.has(article.id)) {
          articlesFound.set(article.id, { ...article, tagCount: 1 });
        } else {
          articlesFound.get(article.id).tagCount += 1;
        }
      });
    }

    // Sort articles by the number of matching tags, descending, and limit to the top 3
    const sortedArticles = Array.from(articlesFound.values())
      .sort((a, b) => b.tagCount - a.tagCount)
      .slice(0, 3);

    res.json(sortedArticles);
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