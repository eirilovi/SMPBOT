// import { Configuration, OpenAIApi } from 'openai';
// import dotenv from 'dotenv';
// dotenv.config();

// const configuration = new Configuration({
//   apiKey: process.env.OPENAI_API_KEY,
// });

// const openai = new OpenAIApi(configuration);
// console.log("API Key:", process.env.OPENAI_API_KEY);

// export default openai;

import { OpenAI } from 'openai';
import dotenv from 'dotenv';
dotenv.config();

const openai = new OpenAI(process.env.OPENAI_API_KEY);
console.log("API Key:", process.env.OPENAI_API_KEY);

export default openai;