'use server';
/**
 * @fileOverview This file implements a Genkit flow to generate a personalized mock exam
 * tailored to a student's weakest topics and desired difficulty level.
 *
 * - generateAdaptiveMockExam - A function that handles the adaptive mock exam generation process.
 * - GenerateAdaptiveMockExamInput - The input type for the generateAdaptiveMockExam function.
 * - GenerateAdaptiveMockExamOutput - The return type for the generateAdaptiveMockExam function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateAdaptiveMockExamInputSchema = z.object({
  studentId: z.string().describe('The ID of the student for whom the exam is being generated. This is used for context, but weakestTopics are provided directly.'),
  weakestTopics: z.array(z.string()).describe('A list of topics where the student has shown weakness.'),
  numQuestions: z.number().int().positive().default(10).describe('The total number of questions to generate for the mock exam. Will be distributed across weakest topics.'),
  difficultyLevel: z.enum(['easy', 'medium', 'hard']).default('medium').describe('The desired difficulty level for the generated questions.'),
});
export type GenerateAdaptiveMockExamInput = z.infer<typeof GenerateAdaptiveMockExamInputSchema>;

const ExamQuestionSchema = z.object({
  question: z.string().describe('The text of the exam question.'),
  options: z.array(z.string()).length(4).describe('An array of exactly four possible answer options (A, B, C, D).'),
  correctAnswer: z.string().describe('The correct answer option (e.g., "A", "B").'),
  topic: z.string().describe('The specific topic this question belongs to from the weakestTopics list.'),
});

const GenerateAdaptiveMockExamOutputSchema = z.object({
  examQuestions: z.array(ExamQuestionSchema).describe('An array of generated exam questions, each with its question text, options, correct answer, and topic.'),
});
export type GenerateAdaptiveMockExamOutput = z.infer<typeof GenerateAdaptiveMockExamOutputSchema>;

const generateAdaptiveMockExamPrompt = ai.definePrompt({
  name: 'generateAdaptiveMockExamPrompt',
  input: { schema: GenerateAdaptiveMockExamInputSchema },
  output: { schema: GenerateAdaptiveMockExamOutputSchema },
  prompt: `You are an AI assistant specialized in generating bank exam questions.

Generate a mock exam for a student, focusing specifically on their identified weakest topics.

Here are the details for generating the exam:
- **Weakest Topics**: {{{weakestTopics}}}
- **Number of Questions**: A total of {{{numQuestions}}} questions should be generated. Distribute these questions as evenly as possible among the weakest topics.
- **Difficulty Level**: The questions should be of '{{{difficultyLevel}}}' difficulty.

For each question, ensure the following:
- Provide the full question text.
- Provide exactly four distinct answer options (e.g., A, B, C, D).
- Clearly state the single correct answer option (e.g., "A").
- Tag the question with one of the specified 'Weakest Topics' that it covers.

Ensure all generated questions are unique, relevant to bank exams, and adhere strictly to the requested difficulty level. The response must be a JSON object containing an array of questions.`,
});

const generateAdaptiveMockExamFlow = ai.defineFlow(
  {
    name: 'generateAdaptiveMockExamFlow',
    inputSchema: GenerateAdaptiveMockExamInputSchema,
    outputSchema: GenerateAdaptiveMockExamOutputSchema,
  },
  async (input) => {
    // The studentId is used for context, but the weakestTopics are provided directly to the prompt.
    // In a full application, 'weakestTopics' might be fetched from a database based on 'studentId'.
    const { output } = await generateAdaptiveMockExamPrompt(input);
    return output!;
  }
);

export async function generateAdaptiveMockExam(input: GenerateAdaptiveMockExamInput): Promise<GenerateAdaptiveMockExamOutput> {
  return generateAdaptiveMockExamFlow(input);
}
