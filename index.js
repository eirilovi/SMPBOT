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

let chatHistory = [
  { 
    role: 'system', 
    content: `You are a helpful AI chatbot for Sunnmørsposten that answers questions with a smile 😊. Communicate briefly and precisely in Bokmål Norwegian. Follow these guidelines:
    1. Always base your answers on verified information. Avoid making up or assuming information that is not explicitly provided or available in documents you have read.
    2. If you mention specific individuals, such as journalists, ensure to use only information from the document you have been assigned, without adding or altering the information.
    3. Be clear and concise in your responses, and avoid lengthy explanations. Aim to provide the information that is necessary and relevant to the user's question.
    4. Use friendly and approachable language, but keep the focus on facts and provided information.`
  }
]; // Store the chat history

 async function checkSubscriptionFAQs(userInput) {
  const subscribeRegex = /abonnent|abonement|abonner/i;

  if (subscribeRegex.test(userInput)) {
    return 'Vil du bli en del av Sunnmørsposten-familien? <br> Vi har abonnementspakker for enhver smak: Digital, Komplett, Ung (under 34 år) og Helg + Digital.😊 <br> Det er enkelt å melde seg på og få tilgang til vårt eksklusive innhold. <br> <a href="https://www.smp.no/dakapo/productpage/SPO/?source=topheader_A" target="_blank">Klikk her for å bli abonnent i dag!</a>';
  
  } else
  return ""; // Return an empty string if no FAQ matches
}
const insertKeywordsToChatHistory = () => {
  const keywords = [
    'abonnent', 'Schibsted', 'min side', 'vilkår', 'passord', 'e-post', 'finner abonnementet',
    'e-postadresse', 'eAvis', 'plussartikler', 'kundenummer', 'eAvisen', 'nedlasting',
    'eAvis tilgjengelig', 'tidligere artikkel', 'gamle utgaver', 'stoppe papiravis',
    'refunder papiravis', 'leverer avis', 'levert avis', 'fått papiravis', 'uteblitt avis',
    'abonnementstyper', 'inkludert i abonnement', 'dele abonnement', 'administrere abonnement',
    'papiravisen uten', 'digital tilgang', 'enkel artikkel', 'pluss', 'kvittering',
    'feil beløp', 'fakturagebyr', 'eFaktura', 'betalingspåminnelse', 'angrerett digital',
    'sagt opp restgiro', 'fakturaperiode', 'betalingskort', 'reduksjon pris', 'Polaris Media'
  ];

  // Push a system message with keywords
  chatHistory.push({
    role: 'system',
    content: `recognized keywords: ${keywords.join(', ')}`
  });
};



app.get('/relevantArticles', async (req, res) => {
  try {
    // Fetch the top 20 most recent articles
    const { data: recentArticles, error: recentError } = await supabase
        .from('Articles')
        .select('*')
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

  const articlesAsJson = data.map(article => {
    return { title: article.title, url: article.url, author: article.author, content: article.content};
  });

  res.json(articlesAsJson);
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

  const articlesAsJson = data.map(article => {
    return { title: article.title, url: article.url, author: article.author, content: article.content};
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
      return { title: article.title, url: article.url, author: article.author, content: article.content};
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
  chatHistory.push({ role: 'user', content: userInput }); // Log user input to chat history

  let response = [];

  // First, check if the user is asking for something that can be answered by FAQs
  let faqResponse = await checkSubscriptionFAQs(userInput);
  if (faqResponse) {
      // FAQ response found, append it to the response array and update chat history
      response.push({ type: 'text', content: faqResponse });
      chatHistory.push({ role: 'system', content: faqResponse });
  } else {
      // Check for tags in the message
      const tags = await findTagsInMessage(userInput);
      if (tags.length > 0) {
          // Fetch articles for each found tag and prepare response
          const articles = [];
          for (let tag of tags) {
              const taggedArticles = await fetchArticlesByTag(tag);
              articles.push(...taggedArticles.map(article => ({
                  type: 'article',
                  title: article.title,
                  content: article.content,
                  url: article.url,
                  author: article.author
              })));
          }

          if (articles.length > 0) {
            response.push({
                type: 'confirm',
                content: "Jeg fant noen artikler med tags som matcher meldingen din. Ønsker du at jeg foreslår dem?😊",
                articles: articles
            });
        } else {
                await askOpenAIForResponse(userInput);
        }
      }

      // If no tags found or no specific content matched, proceed with keyword extraction and article search or OpenAI response
      if (response.length === 0) {
          // Extract keywords from the user input
          const keywords = extractKeywords(userInput);
          if (keywords.length > 0) {
              const articles = await searchArticlesInDatabase(keywords);
              if (articles.length > 0) {
                  // Articles found, prepare article type response
                  articles.forEach(article => {
                      response.push({
                          type: 'article',
                          title: article.title,
                          content: article.content,
                          url: article.url,
                          author: article.author
                      });
                      chatHistory.push({ role: 'system', content: article.title }); // Log article titles to chat history
                  });
              }
          }

          // If no articles or keywords were relevant, fallback to OpenAI's GPT model
          if (response.length === 0) {
              await askOpenAIForResponse(userInput);
          }
      }
  }

  // Send the response array back
  res.json({ response });


async function askOpenAIForResponse() {
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
}});

app.post('/askOpenAIForResponse', async (req, res) => {
  const userInput = req.body.message;
  chatHistory.push({ role: 'user', content: userInput }); // Log user input to chat history

  let response = []; // Initialize response array

  try {
      const openAIResponse = await openai.createChatCompletion({
          model: 'gpt-3.5-turbo',
          messages: chatHistory,
          max_tokens: 300,
      });
      let responseText = openAIResponse.data.choices[0].message.content.trim();
      response.push({ type: 'text', content: responseText });
      chatHistory.push({ role: 'system', content: responseText });
  } catch (error) {
      console.error("Error with OpenAI:", error);
      let errorMessage = "Sorry, I encountered an error processing your request.";
      response.push({ type: 'text', content: errorMessage });
      chatHistory.push({ role: 'system', content: errorMessage });
  }

  // Send the response array back to the frontend
  res.json({ response });
});


async function findTagsInMessage(userInput) {
  const allTags = await getAllTags(); // Fetch all tags from your database
  const inputLower = userInput.toLowerCase();
  const foundTags = allTags.filter(tag => inputLower.includes(tag));
  return foundTags;
}

async function getAllTags() {
  let { data: tags, error } = await supabase
      .from('Articles')
      .select('tags');
  if (error) {
      console.error('Error fetching tags:', error);
      return [];
  }
  const allTags = new Set();
  tags.forEach(article => {
      article.tags.split(',').forEach(tag => allTags.add(tag.trim().toLowerCase()));
  });
  return Array.from(allTags);
}

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
  
  `Write an ULTRA-SHORT summary in norwegian about this article in ONLY THREE bullet points that are SEPERATED WITH PARAGRAPHS using the symbol •: \n\n${article.content}`;

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

// Endpoint to summarize multiple articles for backstory
app.post('/summarizeMultipleArticlesBackstory', async (req, res) => {
  const { contents } = req.body; // 'contents' should be a string containing all articles' content concatenated together

  if (!contents) {
    return res.status(400).send('No contents provided');
  }

  // Prepare prompt for GPT-3-turbo to summarize all contents
  const prompt = `Write an ULTRA-SHORT summary in Norwegian based on the following content, summarizing the main points into one sentence: \n\n${contents}`;

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
    res.status(500).send('Error summarizing articles');
  }
});


app.get('/articlesInSeries/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // Fetch the series information for the current article
    const { data: articleData, error: articleError } = await supabase
      .from('Articles')
      .select('*')
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
      .select('*')
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
      .select('*')
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
        .select('*')
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

async function fetchArticlesByTag(tag) {
  let { data: articles, error } = await supabase
      .from('Articles')
      .select('*')
      .ilike('tags', `%${tag}%`);  // Use ILIKE for case-insensitive matching

  if (error) {
      console.error('Error fetching articles by tags:', error);
      return [];
  }

  return articles;
}



app.get("", (req, res) => {
  res.sendFile(path.join(__dirname, '/index.html'));
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
  insertKeywordsToChatHistory();
});