'use server';
/**
 * @fileOverview This file implements a Genkit flow for evaluating student answers
 * to a mock exam. It combines local deterministic scoring with AI-driven
 * qualitative feedback for maximum speed and accuracy.
 *
 * - evaluateAnswersAndProvideFeedback - A function to trigger the evaluation process.
 * - EvaluateAnswersAndProvideFeedbackInput - The input type for the evaluation function.
 * - EvaluateAnswersAndProvideFeedbackOutput - The return type for the evaluation function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ExamQuestionAttemptSchema = z.object({
  questionText: z.string(),
  correctAnswer: z.string(),
  studentAnswer: z.string(),
  topic: z.string(),
});

const EvaluateAnswersAndProvideFeedbackInputSchema = z.object({
  examAttempt: z.array(ExamQuestionAttemptSchema),
});

export type EvaluateAnswersAndProvideFeedbackInput = z.infer<typeof EvaluateAnswersAndProvideFeedbackInputSchema>;

const TopicAnalysisSchema = z.object({
  topic: z.string(),
  performancePercentage: z.number(),
  weaknessIdentified: z.boolean(),
  feedback: z.string(),
});

const QuestionEvaluationSchema = z.object({
  questionText: z.string(),
  studentAnswer: z.string(),
  correctAnswer: z.string(),
  isCorrect: z.boolean(),
  score: z.number(),
  detailedFeedback: z.string().describe('Explanation of why the answer was correct or incorrect and how to solve it.'),
});

const EvaluateAnswersAndProvideFeedbackOutputSchema = z.object({
  overallScore: z.number(),
  overallFeedback: z.string(),
  topicAnalysis: z.array(TopicAnalysisSchema),
  questionEvaluations: z.array(QuestionEvaluationSchema),
  weakestTopics: z.array(z.string()),
});

export type EvaluateAnswersAndProvideFeedbackOutput = z.infer<typeof EvaluateAnswersAndProvideFeedbackOutputSchema>;

const evaluatePrompt = ai.definePrompt({
  name: 'evaluateAnswersAndProvideFeedbackPrompt',
  input: { 
    schema: z.object({
      examAttempt: z.array(ExamQuestionAttemptSchema.extend({
        isCorrect: z.boolean(),
      })),
      localOverallScore: z.number()
    })
  },
  output: { schema: EvaluateAnswersAndProvideFeedbackOutputSchema },
  prompt: `You are an expert bank exam coach. I have already calculated the raw scores for this student's exam.
  
Student Score: {{localOverallScore}}%

Your task is to provide the qualitative "Human" layer of feedback. 
For each question, provide a 'detailedFeedback' explaining the logic, the shortcuts that could have been used, and why their choice was right or wrong.

Then provide:
1. 'overallFeedback': A motivational but honest summary of their attempt.
2. 'topicAnalysis': An analysis of how they did per topic.
3. 'weakestTopics': Identify topics where performance was low.

Here is the attempt data:
{{#each examAttempt}}
- Topic: {{{topic}}}
- Question: {{{questionText}}}
- Student Answer: {{{studentAnswer}}}
- Correct Answer: {{{correctAnswer}}}
- Result: {{#if isCorrect}}Correct{{else}}Incorrect{{/if}}
{{/each}}`,
});

export async function evaluateAnswersAndProvideFeedback(
  input: EvaluateAnswersAndProvideFeedbackInput
): Promise<EvaluateAnswersAndProvideFeedbackOutput> {
  // 1. Calculate accuracy deterministically to save AI reasoning time
  const processedAttempts = input.examAttempt.map(attempt => ({
    ...attempt,
    isCorrect: attempt.studentAnswer === attempt.correctAnswer,
  }));

  const correctCount = processedAttempts.filter(p => p.isCorrect).length;
  const localOverallScore = (correctCount / processedAttempts.length) * 100;

  // 2. AI generates the feedback
  const { output } = await evaluatePrompt({
    examAttempt: processedAttempts,
    localOverallScore
  });

  if (!output) throw new Error('Feedback generation failed');

  // 3. Final sanitization: ensure AI didn't hallucinate the basic facts
  return {
    ...output,
    overallScore: localOverallScore,
    questionEvaluations: output.questionEvaluations.map((evalItem, i) => {
      const original = processedAttempts[i];
      return {
        ...evalItem,
        questionText: original.questionText,
        studentAnswer: original.studentAnswer,
        correctAnswer: original.correctAnswer,
        isCorrect: original.isCorrect,
        score: original.isCorrect ? 1 : 0
      };
    })
  };
}
