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
  studentId: z.string().describe('The ID of the student for whom the exam is being generated.'),
  weakestTopics: z.array(z.string()).describe('A list of topics where the student has shown weakness.'),
  numQuestions: z.number().int().positive().default(10).describe('The total number of questions to generate.'),
  difficultyLevel: z.enum(['easy', 'medium', 'hard']).default('medium').describe('The desired difficulty level.'),
});
export type GenerateAdaptiveMockExamInput = z.infer<typeof GenerateAdaptiveMockExamInputSchema>;

const ExamQuestionSchema = z.object({
  question: z.string().describe('The text of the exam question.'),
  options: z.array(z.string()).length(4).describe('An array of exactly four possible answer options (A, B, C, D).'),
  correctAnswer: z.string().describe('The correct answer option (e.g., "A", "B").'),
  topic: z.string().describe('The specific topic this question belongs to.'),
});

const GenerateAdaptiveMockExamOutputSchema = z.object({
  examQuestions: z.array(ExamQuestionSchema).describe('An array of generated exam questions.'),
});
export type GenerateAdaptiveMockExamOutput = z.infer<typeof GenerateAdaptiveMockExamOutputSchema>;

const generateAdaptiveMockExamPrompt = ai.definePrompt({
  name: 'generateAdaptiveMockExamPrompt',
  input: { schema: GenerateAdaptiveMockExamInputSchema },
  output: { schema: GenerateAdaptiveMockExamOutputSchema },
  prompt: `You are an AI assistant specialized in generating bank exam questions.

Generate a mock exam for a student, focusing specifically on their identified weakest topics.

Details for generating the exam:
- Weakest Topics: {{{weakestTopics}}}
- Number of Questions: {{{numQuestions}}} (distribute evenly among the weakest topics)
- Difficulty Level: {{{difficultyLevel}}}

For each question:
- Provide the full question text.
- Provide exactly four distinct answer options (A, B, C, D).
- State the correct answer option (e.g., "A").
- Tag with one of the specified 'Weakest Topics'.

Ensure all questions are unique and relevant to bank exams.`,
});

const generateAdaptiveMockExamFlow = ai.defineFlow(
  {
    name: 'generateAdaptiveMockExamFlow',
    inputSchema: GenerateAdaptiveMockExamInputSchema,
    outputSchema: GenerateAdaptiveMockExamOutputSchema,
  },
  async (input) => {
    const { output } = await generateAdaptiveMockExamPrompt(input);
    if (!output) {
      throw new Error('Failed to generate adaptive mock exam.');
    }
    return output;
  }
);

export async function generateAdaptiveMockExam(input: GenerateAdaptiveMockExamInput): Promise<GenerateAdaptiveMockExamOutput> {
  return generateAdaptiveMockExamFlow(input);
}
