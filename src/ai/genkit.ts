import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

const apiKey = 'AIzaSyAczuu2Oy4nDBnMRYuHH4dZ3JJpDehXqsQ';

export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: apiKey,
    }),
  ],
  model: 'googleai/gemini-1.5-flash',
});
