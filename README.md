# Sunnmørsposten Chatbot

The Sunnmørsposten Chatbot is an interactive assistant designed to provide real-time information and support to users. It can fetch articles, handle customer service inquiries, and offer a rich user interaction interface with a focus on Bokmål Norwegian. This project is structured with a Node.js backend utilizing Express and a dynamic frontend built with vanilla JavaScript.

## Features

- **Article Fetching**: Users can request articles by categories, importance, or randomly.
- **Dynamic FAQ System**: Supports interactive FAQs for customer service.
- **Real-time Interaction**: Includes typing animations to simulate real-time interactions.
- **Responsive Chat Interface**: A fully interactive chat interface which handles both predefined and dynamic responses.
- **Subscription Management**: Provides information on how to manage subscriptions.

# Installation

## 1. Clone the repository:
```bash
git clone https://github.com/eirilovi/SMPBOT
```

2. Install dependencies:
npm install

3. Set up the environment variables:
Create a .env file in the root directory and update it with the necessary API keys and database connection details.

SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anonymous_key


4. Start the server:
npm start


This will run the server on http://localhost:3000.

Usage

The Sunnmørsposten Chatbot offers a dual-functionality interface, serving both as a general assistant and an article-specific assistant, enriching the user's interaction with real-time data and services.

### General Chatbot Functionality

- **Article Recommendations:** Users can request the chatbot to recommend articles based on specific subjects or interests, and the bot will fetch and present relevant articles to explore further.
- **Dynamic Response Buttons**: Throughout the chat, the bot may present buttons that users can click to perform specific actions, such as fetching articles, viewing article categories, or addressing frequently asked questions directly related to customer service.
- **Subscription Information**: The bot provides detailed instructions on managing subscriptions through interactive prompts and links.

### Article-Specific Functionality

- **Contextual Interaction**: When accessing an article-specific page, the chatbot enhances the user's experience by offering targeted interactions:
  - **Ask Questions About the Current Article**: Users can inquire directly in the chat about details or clarifications related to the article they are currently viewing.
  - **Article Navigation Buttons**: The bot provides buttons that allow users to summon related articles, summarize the content, and explore articles within the same series or similar themes.

###Navigational and Functional Buttons

- **Summarize Article**: Quickly get a concise summary of the article directly in the chat interface.
- **Find Similar Articles**: The bot can search for and display articles that are similar in content or theme to the current article.
- **View Series Articles**: If the article is part of a series, users can navigate through other articles in the same series with just a click.
- **Backstory Explanation**: For articles that are part of broader coverage, the bot can provide a backstory or a summarized context to enhance understanding.  
