import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Safely resolve .env path without using __dirname (which causes ReferenceError in ES Module environments like Vercel)
let envPath = path.join(process.cwd(), 'backend/.env');
if (!fs.existsSync(envPath)) {
  envPath = path.join(process.cwd(), '.env');
}
dotenv.config({ path: envPath });

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
