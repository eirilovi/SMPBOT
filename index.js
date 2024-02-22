import openai from './config/open-ai.js';
import readlineSync from 'readline-sync';
import colors from 'colors';
import fs from 'fs';

async function main() {
  console.log(colors.bold.green('Welcome to the Chatbot Program!'));

  // Load articles from the JSON file
  const articlesData = JSON.parse(fs.readFileSync('./sample_articles.json', 'utf8'));

  // Define the list of categories
  const categories = Object.keys(articlesData);

  // Ask the question and present the list of categories to choose from
  console.log(colors.bold.green('Please select a category you are interested in:'));
  const selectedCategoryIndex = readlineSync.keyInSelect(categories, 'Categories: ', {
    cancel: 'None of the above'
  });

  // Initialize conversation history
  const chatHistory = [];
  let selectedCategory;

  // Check if a category was selected and add it to the chat history
  if (selectedCategoryIndex !== -1) {
    selectedCategory = categories[selectedCategoryIndex];
    console.log(colors.bold.green(`You selected ${selectedCategory}.`));
    // Add a system-level message to the chat history
    chatHistory.push({ role: 'system', content: `The user is interested in the category ${selectedCategory}.` });
  }

  console.log(colors.bold.green('You can start chatting with the bot.'));

  while (true) {
    const userInput = readlineSync.question(colors.yellow('You: '));

    // Check if the user wants to exit the chat
    if (userInput.toLowerCase() === 'exit') {
      console.log(colors.green('Exiting the Chatbot Program. Goodbye!'));
      break;
    }

    const listArticlesRegex = /list.*articles/i;

    // Check if the user input matches the intent to list articles
    if (listArticlesRegex.test(userInput) && selectedCategory) {
      // List articles for the selected category
      const articles = articlesData[selectedCategory];
      console.log(`Bot: Here are the articles under ${selectedCategory}:`);
      articles.forEach(article => {
        console.log(`- ${article.title}`);
      });
      // Don't forget to continue after handling so that the loop does not send this to the OpenAI API
      continue;
    }

    try {
      // Construct messages by iterating over the history
      const messages = chatHistory.map(({ role, content }) => ({
        role,
        content,
      }));

      // Add latest user input
      messages.push({ role: 'user', content: userInput });

      // Call the API with user input & history
      const completion = await openai.createChatCompletion({
        model: 'gpt-3.5-turbo',
        messages: messages,
      });

      // Get completion text/content
      const completionText = completion.data.choices[0].message.content;

      console.log(colors.green('Bot: ') + completionText);

      // Update history with user input and assistant response
      chatHistory.push({ role: 'user', content: userInput });
      chatHistory.push({ role: 'assistant', content: completionText });
    } catch (error) {
      console.error(colors.red(`Error: ${error.message}`));
      break; // Exit the loop in case of an error
    }
  }
}

main();
