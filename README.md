# Sunnmørsposten Chatbot

The Chatbot is made for Sunnmørsposten to engage users with the website. The chatbot uses Node.js for its backend and vanilla JavaScript for its frontend.

## Code Overview
Check the Bachelor's thesis report for a full discussion of this project.

## Features

- **Article Fetching**: You can ask for articles based on your interests
- **Real-time Interaction**: Uses typing animations to make the responses feel more human-like.
- **Responsive Chat Interface**: A chat system that can handle many different types of user requests.
- **Sleek and Modern Design**: Looks good and works smoothly.

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


### Article-Specific

- **Quick Tools**:
  - **Summarize Article**: The chatbot can quickly make a summary about the article.
  - **Find Similar Articles**: It can find articles with the same tags that the current one has.
  - **View Series Articles**: If the article is part of a series, the chatbot can give you the context-articles.
  - **Backstory Explanation**: If the article has a complicated backstory, the chatbot will give you a summary of the contextual articles.

