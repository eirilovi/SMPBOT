# Sunnmørsposten Chatbot

The Sunnmørsposten Chatbot is an interactive assistant designed to provide real-time information and support to users. It can fetch articles, handle customer service inquiries, and offer a rich user interaction interface with a focus on Bokmål Norwegian. This project is structured with a Node.js backend utilizing Express and a dynamic frontend built with vanilla JavaScript.

## Features

- **Article Fetching**: Users can request articles by categories, importance, or randomly.
- **Dynamic FAQ System**: Supports interactive FAQs for customer service.
- **Real-time Interaction**: Includes typing animations to simulate real-time interactions.
- **Responsive Chat Interface**: A fully interactive chat interface which handles both predefined and dynamic responses.
- **Sleek and Modern Design**: Crafted with attention to aesthetics and usability, ensuring a visually appealing and smooth user experience.

# Installation

## 1. Clone the repository:
```bash
git clone https://github.com/eirilovi/SMPBOT
```

## 2. Install dependencies:
```bash
npm install
```

## 3. Set up the environment variables: 
Create a .env file in the root directory and update it with the necessary API keys and database connection details.
```bash
SUPABASE_URL=your_supabase_url

SUPABASE_ANON_KEY=your_supabase_anonymous_key
```
## 4. Start the server:
```bash
npm start
```
This will run the server on http://localhost:3000.

## Usage

The Sunnmørsposten Chatbot offers a dual-functionality interface, serving both as a general assistant and an article-specific assistant, enriching the user's interaction with real-time data and services.

### General Chatbot Functionality

- **Article Recommendations:** Users can request the chatbot to recommend articles based on specific subjects or interests, and the bot will fetch and present relevant articles to explore further.
- **Functional Buttons:**
    - **Bli Abonnent (Become a Subscriber):** Directs users to subscription options and sign-up details.
    - **Relevante artikler (Relevant Articles):** Fetches and displays articles that are trending or relevant to the user’s interests.
    - **Artikler for Ungdom (Articles for Youth):** Showcases articles specifically curated for younger readers.
    - **Kategorier (Categories):** Allows users to explore articles based on different categories available on the platform. Upon selecting this button, the chatbot displays a list of available categories. After a user selects a category, they are presented with further       options to explore articles within that category:
      - **Nyeste artikler (Latest Articles):** Displays the most recent articles published under the selected category.
      - **Viktigste artikler (Important Articles):** Shows articles deemed most important or impactful within the selected category, providing users with critical insights and major developments.
      - **Tilfeldig artikkel (Random Article):** Offers a randomly selected article from the chosen category, allowing users to discover diverse content they might not have otherwise encountered.
  - **Kundeservice (Customer Service):** Provides answers to common customer service questions and directs users to further assistance if needed.

### Article-Specific Functionality

- **Contextual Interaction**: When accessing an article-specific page, the chatbot enhances the user's experience by offering targeted interactions:
  - **Ask Questions About the Current Article**: Users can inquire directly in the chat about details or clarifications related to the article they are currently viewing.
  - **Article Navigation Buttons**: The bot provides buttons that allow users to summon related articles, summarize the content, and explore articles within the same series or similar themes.
    
- **Navigational and Functional Buttons**:
  - **Summarize Article**: Quickly get a concise summary of the article directly in the chat interface.
  - **Find Similar Articles**: The bot can search for and display articles that are similar in content or theme to the current article.
  - **View Series Articles**: If the article is part of a series, users can navigate through other articles in the same series with just a click.
  - **Backstory Explanation**: For articles that are part of broader coverage, the bot can provide a backstory or a summarized context to enhance understanding.  
