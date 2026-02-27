'use server';
/**
 * @fileOverview This file implements a Genkit flow for generating unique and relevant bank exam questions.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateMockExamQuestionsInputSchema = z.object({
  studentId: z.string(),
  examType: z.string(),
  numQuestions: z.number().int().min(1).max(10),
  difficultyLevel: z.enum(['easy', 'medium', 'hard']).optional(),
  weakTopics: z.array(z.string()).optional(),
  strongTopics: z.array(z.string()).optional(),
  previousQuestionContext: z.array(z.string()).optional(),
});
export type GenerateMockExamQuestionsInput = z.infer<typeof GenerateMockExamQuestionsInputSchema>;

const QuestionSchema = z.object({
  questionId: z.string(),
  questionText: z.string(),
  options: z.array(z.string()).min(4).max(4),
  correctAnswer: z.string().describe('The correct answer option label (MUST BE one of: "A", "B", "C", or "D").'),
  explanation: z.string(),
  topic: z.string(),
  difficulty: z.enum(['easy', 'medium', 'hard']),
});

const GenerateMockExamQuestionsOutputSchema = z.object({
  questions: z.array(QuestionSchema),
});
export type GenerateMockExamQuestionsOutput = z.infer<typeof GenerateMockExamQuestionsOutputSchema>;

const generateQuestionsPrompt = ai.definePrompt({
  name: 'generateBankExamQuestionsPrompt',
  input: { schema: GenerateMockExamQuestionsInputSchema },
  output: { schema: GenerateMockExamQuestionsOutputSchema },
  prompt: `You are an expert in bank exam question generation. 

Requirements:
- Exam Type: {{{examType}}}
- Number of Questions: {{numQuestions}}
- Topic Focus: {{#if weakTopics}}Prioritize: {{#each weakTopics}}"{{this}}" {{/each}}{{/if}}
- Correct Answer Format: The 'correctAnswer' field MUST be exactly one of "A", "B", "C", or "D".

Generate unique, relevant multiple-choice questions.`,
});

const generateMockExamQuestionsFlow = ai.defineFlow(
  {
    name: 'generateMockExamQuestionsFlow',
    inputSchema: GenerateMockExamQuestionsInputSchema,
    outputSchema: GenerateMockExamQuestionsOutputSchema,
  },
  async (input) => {
    const { output } = await generateQuestionsPrompt(input);
    if (!output) {
      throw new Error('Failed to generate mock exam questions.');
    }
    return output;
  }
);

export async function generateMockExamQuestions(
  input: GenerateMockExamQuestionsInput
): Promise<GenerateMockExamQuestionsOutput> {
  return generateMockExamQuestionsFlow(input);
}
