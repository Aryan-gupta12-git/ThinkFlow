import Groq from 'groq-sdk';
import { config } from './index';

export const groq = new Groq({
  apiKey: config.GROQ_API_KEY,
});

export default groq;
