import express from 'express';
import bodyParser from 'body-parser';
import fs from 'fs';
import openai from './config/open-ai.js'; // Adjust the path as necessary
import cors from 'cors'; // If you're using ES Modules

const app = express();
app.use(bodyParser.json()); // for parsing application/json


app.use(cors({
  origin: 'http://localhost:8080', // Only allow requests from this origin
  methods: ['GET', 'POST'], // Only allow these methods
}));

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

// Endpoint to process questions
app.post('/ask', async (req, res) => {
  const userInput = req.body.message;
  let responseText = checkSubscriptionFAQs(userInput); // Check FAQs first

  if (!responseText) { // If not an FAQ, proceed with OpenAI
    try {
      const openAIResponse = await openai.createChatCompletion({
        model: 'gpt-3.5-turbo',
        prompt: userInput,
        max_tokens: 150,
      });
      responseText = openAIResponse.data.choices[0].text.trim();
    } catch (error) {
      console.error("Error with OpenAI:", error);
      responseText = "Sorry, I encountered an error processing your request.";
    }
  }

  res.json({ response: responseText }); // Send the response
});

const port = 3000;
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
