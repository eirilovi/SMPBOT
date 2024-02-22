import openai from './config/open-ai.js';
import readlineSync from 'readline-sync';
import colors from 'colors';
import fs from 'fs';

// Regular expressions for each question
function checkSubscriptionFAQs(userInput) {
  const subscribeRegex = /how.*subscribe/i;
  const plansRegex = /subscription.*plans/i;
  const cancelSubscriptionRegex = /cancel.*subscription/i;
  const accessContentRegex = /can.*access.*subscriber.*content/i;

  if (subscribeRegex.test(userInput)) {
    console.log(`Bot: Press "+Få tilgang" in the top right corner of the menu-bar. Then select your preferred subscription. Then select your payment method. Then log in to your "Schibsted" account. After payment, you should have a subscription.`);
    return true;
  } else if (plansRegex.test(userInput)) {
    console.log(`Bot: The subscription plans available are Digital, Complete, Young (Under 34), and Weekend papers + Digital.`);
    return true;
  } else if (cancelSubscriptionRegex.test(userInput)) {
    console.log(`Bot: To cancel your subscription, please visit https://minside.smp.no/endre-abonnement and select "Stopp abonnement".`);
    return true;
  } else if (accessContentRegex.test(userInput)) {
    console.log(`Bot: If you can't access subscriber-only content, it may mean that you don't have an active subscription, or that your subscription has not been fully prepared yet. If the problem persists, please contact us at abonnement@smp.no.`);
    return true;
  }
  // If none of the regular expressions match, return false to indicate no match was found
  return false;
}

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

  const listArticlesRegex = /list.*articles/i;

  let awaitingYesNoResponse = false;
  let lastUserInput = '';
  
  while (true) {
    let userInput;
    if (!awaitingYesNoResponse) {
      userInput = readlineSync.question(colors.yellow('You: '));
      lastUserInput = userInput; // Store the last user input
    } else {
      userInput = readlineSync.question(colors.yellow("Please respond with 'Yes' or 'No': "));
    }
  
    // Check if the user wants to exit the chat
    if (userInput.toLowerCase() === 'exit') {
      console.log(colors.green('Exiting the Chatbot Program. Goodbye!'));
      break;
    }
  
    if (!awaitingYesNoResponse) {
      // Check if the input matches any hard-coded responses
      if (checkSubscriptionFAQs(userInput)) {
        continue;
      }
  
      if (listArticlesRegex.test(userInput) && selectedCategory) {
        const articles = articlesData[selectedCategory];
        console.log(`Bot: Here are the articles under ${selectedCategory}:`);
        articles.forEach(article => {
          console.log(`- ${article.title}`);
        });
        continue; // Ensure to continue the loop after listing articles
      }
    }
  
    if (awaitingYesNoResponse) {
      if (userInput.toLowerCase() === 'yes') {
        awaitingYesNoResponse = false; // Reset the flag
        try {
          // Interact with ChatGPT using the last stored user input
          const messages = chatHistory.map(({ role, content }) => ({
            role,
            content,
          }));
  
          messages.push({ role: 'user', content: lastUserInput });
  
          const completion = await openai.createChatCompletion({
            model: 'gpt-3.5-turbo',
            messages: messages,
          });
  
          const completionText = completion.data.choices[0].message.content;
          console.log(colors.green('Bot: ') + completionText);
  
          chatHistory.push({ role: 'user', content: lastUserInput });
          chatHistory.push({ role: 'assistant', content: completionText });
        } catch (error) {
          console.error(colors.red(`Error: ${error.message}`));
          console.log(colors.yellow("There was an error processing your request. Would you like to try again? (Yes/No)"));
          const tryAgain = readlineSync.question(colors.yellow('You: '));
          if (tryAgain.toLowerCase() !== 'yes') {
            console.log(colors.green('Goodbye!'));
            break; // Exit the loop and the program
          }
        }
      } else if (userInput.toLowerCase() === 'no') {
        awaitingYesNoResponse = false; // Reset the flag
        continue; // Skip the rest of the loop to allow new user input
      } else {
        console.log(colors.red("Please respond with 'Yes' or 'No'."));
        continue; // Stay in the loop until a valid response is received
      }
    } else {
      console.log(colors.yellow("It appears I don't have an answer for this question. You might want to check for typos in your message. Alternatively, you can speak to ChatGPT. Do you want to continue to ChatGPT? (Yes/No)"));
      awaitingYesNoResponse = true; // Set the flag as we now await a "yes" or "no"
    }
  }
  
}

// Call the main function to start the chatbot
main();
