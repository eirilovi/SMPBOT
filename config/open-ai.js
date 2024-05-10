import { Configuration, OpenAIApi } from 'openai';
import dotenv from 'dotenv';
import process from 'process';
dotenv.config();

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);
console.log("API Key:", process.env.OPENAI_API_KEY);

export default openai;
