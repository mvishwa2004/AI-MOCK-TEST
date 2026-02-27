import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

const apiKey = process.env.GOOGLE_GENAI_API_KEY || process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY || 'AIzaSyAczuu2Oy4nDBnMRYuHH4dZ3JJpDehXqsQ';

if (!apiKey || apiKey === 'AIzaSyAczuu2Oy4nDBnMRYuHH4dZ3JJpDehXqsQ') {
  if (!apiKey) {
    console.warn("Genkit: No Google AI API key found in environment variables. Using provided fallback.");
  }
}

export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: apiKey,
    }),
  ],
  model: 'googleai/gemini-1.5-flash',
});
