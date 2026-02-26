'use server';
/**
 * @fileOverview This file implements a Genkit flow for generating unique and relevant bank exam questions.
 *
 * - generateMockExamQuestions - A function that generates mock exam questions based on student preferences and performance.
 * - GenerateMockExamQuestionsInput - The input type for the generateMockExamQuestions function.
 * - GenerateMockExamQuestionsOutput - The return type for the generateMockExamQuestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Input Schema for generating mock exam questions
const GenerateMockExamQuestionsInputSchema = z.object({
  studentId: z.string().describe('The unique identifier for the student.'),
  examType: z.string().describe('The type of bank exam (e.g., IBPS PO, SBI Clerk, RBI Grade B).'),
  numQuestions: z.number().int().min(1).max(10).describe('The number of questions to generate for the mock exam.'),
  difficultyLevel: z.enum(['easy', 'medium', 'hard']).optional().describe('The desired difficulty level for the questions.'),
  weakTopics: z.array(z.string()).optional().describe('A list of topics where the student has shown weakness, to focus question generation.'),
  strongTopics: z.array(z.string()).optional().describe('A list of topics where the student has shown strength, to potentially de-prioritize or integrate with other topics.'),
  previousQuestionContext: z.array(z.string()).optional().describe('A summary or keywords from previously asked questions to help avoid generating identical questions in terms of core concept or specific phrasing.'),
});
export type GenerateMockExamQuestionsInput = z.infer<typeof GenerateMockExamQuestionsInputSchema>;

// Output Schema for generated mock exam questions
const QuestionSchema = z.object({
  questionId: z.string().describe('A unique alphanumeric identifier for this question (e.g., QID_Math_001).'),
  questionText: z.string().describe('The main text of the question.'),
  options: z.array(z.string()).min(2).max(5).describe('An array of possible answer options for the multiple-choice question.'),
  correctAnswer: z.string().describe('The correct answer option from the options array.'),
  explanation: z.string().describe('A detailed explanation for the correct answer.'),
  topic: z.string().describe('The specific topic this question covers (e.g., "Quantitative Aptitude - Data Interpretation", "Reasoning Ability - Puzzles").'),
  difficulty: z.enum(['easy', 'medium', 'hard']).describe('The difficulty level of the generated question.'),
});

const GenerateMockExamQuestionsOutputSchema = z.object({
  questions: z.array(QuestionSchema).describe('A list of generated bank exam questions.'),
});
export type GenerateMockExamQuestionsOutput = z.infer<typeof GenerateMockExamQuestionsOutputSchema>;

// Define the Genkit prompt
const generateQuestionsPrompt = ai.definePrompt({
  name: 'generateBankExamQuestionsPrompt',
  input: { schema: GenerateMockExamQuestionsInputSchema },
  output: { schema: GenerateMockExamQuestionsOutputSchema },
  prompt: `You are an expert in bank exam question generation. Your task is to create a set of unique and relevant multiple-choice questions for a bank examination.

Here are the requirements for the questions:
- **Exam Type**: {{{examType}}}
- **Number of Questions**: Generate exactly {{numQuestions}} questions.
- **Difficulty Level**: {{#if difficultyLevel}}Focus on "{{difficultyLevel}}" difficulty.{{else}}Vary the difficulty between easy, medium, and hard.{{/if}}
- **Topic Focus**:
  {{#if weakTopics}}
  - **Weak Topics (Prioritize)**: Focus heavily on these topics to help the student improve: {{#each weakTopics}} "{{this}}"{{/each}}.
  {{/if}}
  {{#if strongTopics}}
  - **Strong Topics (Include but don't overemphasize)**: Include some questions from these topics: {{#each strongTopics}} "{{this}}"{{/each}}.
  {{/if}}
  {{#unless weakTopics}}
  - If no specific weak topics are provided, cover a broad range of topics relevant to the {{{examType}}} exam.
  {{/unless}}
- **Uniqueness**:
  {{#if previousQuestionContext}}
  - Do not generate questions that are identical in concept or phrasing to the following previous questions summaries/keywords: {{#each previousQuestionContext}} "{{this}}"{{/each}}.
  - Strive for novel scenarios and data sets where applicable.
  {{else}}
  - Ensure all generated questions are unique and fresh.
  {{/if}}
- **Format**: Each question must be a multiple-choice question with 2 to 5 options. Provide a clear correct answer and a concise explanation.

Generate the questions in a JSON array format that matches the output schema provided. Ensure all fields in the schema are populated accurately.
`
});

// Define the Genkit flow
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

// Exported wrapper function
export async function generateMockExamQuestions(
  input: GenerateMockExamQuestionsInput
): Promise<GenerateMockExamQuestionsOutput> {
  return generateMockExamQuestionsFlow(input);
}
