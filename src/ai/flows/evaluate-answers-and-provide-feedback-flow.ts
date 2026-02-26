'use server';
/**
 * @fileOverview This file implements a Genkit flow for evaluating student answers
 * to a mock exam, calculating scores, identifying weak topics, and generating
 * personalized feedback for improvement.
 *
 * - evaluateAnswersAndProvideFeedback - A function to trigger the evaluation process.
 * - EvaluateAnswersAndProvideFeedbackInput - The input type for the evaluation function.
 * - EvaluateAnswersAndProvideFeedbackOutput - The return type for the evaluation function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ExamQuestionAttemptSchema = z.object({
  questionText: z.string().describe('The full text of the exam question.'),
  correctAnswer: z.string().describe('The correct answer to the question.'),
  studentAnswer: z.string().describe('The answer provided by the student.'),
  topic: z.string().describe('The topic this question belongs to (e.g., "Quantitative Aptitude", "Reasoning", "English").'),
});

const EvaluateAnswersAndProvideFeedbackInputSchema = z.object({
  examAttempt: z.array(ExamQuestionAttemptSchema).describe('An array of objects, each representing a question, its correct answer, and the student\'s submission.'),
});

export type EvaluateAnswersAndProvideFeedbackInput = z.infer<typeof EvaluateAnswersAndProvideFeedbackInputSchema>;

const TopicAnalysisSchema = z.object({
  topic: z.string().describe('The name of the topic.'),
  performancePercentage: z.number().describe('The percentage score achieved in this topic.'),
  weaknessIdentified: z.boolean().describe('True if this is identified as a weak topic for the student.'),
  feedback: z.string().describe('General feedback for this specific topic, highlighting strengths or areas for improvement.'),
});

const QuestionEvaluationSchema = z.object({
  questionText: z.string().describe('The question text.'),
  studentAnswer: z.string().describe('The student\'s answer.'),
  correctAnswer: z.string().describe('The correct answer.'),
  isCorrect: z.boolean().describe('Whether the student\'s answer is correct.'),
  score: z.number().describe('The score awarded for this question (e.g., 0 for incorrect, 1 for correct, or partial marks).'),
  detailedFeedback: z.string().describe('Specific feedback for the student\'s answer to this question, explaining errors and suggesting improvements.'),
});

const EvaluateAnswersAndProvideFeedbackOutputSchema = z.object({
  overallScore: z.number().describe('The total score obtained by the student in the exam attempt (as a percentage, 0-100).'),
  overallFeedback: z.string().describe('Comprehensive feedback and recommendations for the student based on their overall performance.'),
  topicAnalysis: z.array(TopicAnalysisSchema).describe('An analysis of the student\'s performance across different topics.'),
  questionEvaluations: z.array(QuestionEvaluationSchema).describe('Detailed evaluation for each question attempted by the student.'),
  weakestTopics: z.array(z.string()).describe('An array of topics where the student performed poorly and needs improvement.'),
});

export type EvaluateAnswersAndProvideFeedbackOutput = z.infer<typeof EvaluateAnswersAndProvideFeedbackOutputSchema>;

const evaluateAnswersAndProvideFeedbackPrompt = ai.definePrompt({
  name: 'evaluateAnswersAndProvideFeedbackPrompt',
  input: { schema: EvaluateAnswersAndProvideFeedbackInputSchema },
  output: { schema: EvaluateAnswersAndProvideFeedbackOutputSchema },
  prompt: `You are an expert exam evaluator for bank examinations. Your task is to meticulously evaluate a student's answers to a mock exam.

For each question, compare the student's answer against the correct answer, determine if it's correct, assign a score (1 for correct, 0 for incorrect), and provide detailed, constructive feedback explaining errors and suggesting improvements.

After evaluating all questions, provide a comprehensive analysis including:
1. An overall score for the entire exam (as a percentage).
2. A breakdown of performance by topic, identifying weak and strong areas.
3. A list of the weakest topics.
4. Overall personalized feedback with suggestions for improvement.

Strictly adhere to the following evaluation criteria:
- Accuracy: Is the student's answer factually correct?
- Completeness: Does the student's answer fully address the question?
- Clarity: Is the student's answer clear and well-explained?
- Relevance: Is the student's answer pertinent to the question asked?

Here are the exam attempts for evaluation:

{{#each examAttempt}}
---
Question: {{{questionText}}}
Correct Answer: {{{correctAnswer}}}
Student's Answer: {{{studentAnswer}}}
Topic: {{{topic}}}
---
{{/each}}

Based on the above, provide the evaluation in JSON format according to the specified output schema. Ensure all fields are populated correctly, especially calculating 'overallScore' as a percentage (0-100) and identifying 'weakestTopics' based on performance percentages.`,
});

const evaluateAnswersAndProvideFeedbackFlow = ai.defineFlow(
  {
    name: 'evaluateAnswersAndProvideFeedbackFlow',
    inputSchema: EvaluateAnswersAndProvideFeedbackInputSchema,
    outputSchema: EvaluateAnswersAndProvideFeedbackOutputSchema,
  },
  async (input) => {
    const { output } = await evaluateAnswersAndProvideFeedbackPrompt(input);
    return output!;
  }
);

export async function evaluateAnswersAndProvideFeedback(
  input: EvaluateAnswersAndProvideFeedbackInput
): Promise<EvaluateAnswersAndProvideFeedbackOutput> {
  return evaluateAnswersAndProvideFeedbackFlow(input);
}
