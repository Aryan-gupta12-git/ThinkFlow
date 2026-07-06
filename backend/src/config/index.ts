import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from the .env file in the backend directory
dotenv.config({ path: path.join(__dirname, '../../.env') });

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;
const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

if (!GROQ_API_KEY) {
  console.warn('WARNING: GROQ_API_KEY is not defined in the environment variables. API calls requiring AI generation/analysis will fail.');
}

export const config = {
  PORT,
  GROQ_API_KEY,
  GROQ_MODEL,
};
export default config;
