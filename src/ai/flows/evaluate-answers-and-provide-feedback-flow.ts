'use server';
/**
 * @fileOverview This file implements a Genkit flow for evaluating student answers
 * to a mock exam. It combines local deterministic scoring with AI-driven
 * qualitative feedback for maximum speed and accuracy.
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

Your task is to provide the qualitative layer of feedback. 
For each question, provide a 'detailedFeedback' explaining the logic, shortcuts, and why their choice was right or wrong.

Provide:
1. 'overallFeedback': A motivational summary.
2. 'topicAnalysis': Performance per topic.
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
  // 1. Calculate accuracy deterministically (resilient to case and whitespace)
  const processedAttempts = input.examAttempt.map(attempt => {
    const studentAns = (attempt.studentAnswer || "").trim().toUpperCase();
    const correctAns = (attempt.correctAnswer || "").trim().toUpperCase();
    return {
      ...attempt,
      isCorrect: studentAns === correctAns,
    };
  });

  const correctCount = processedAttempts.filter(p => p.isCorrect).length;
  const localOverallScore = processedAttempts.length > 0 ? (correctCount / processedAttempts.length) * 100 : 0;

  // 2. AI generates qualitative feedback
  const { output } = await evaluatePrompt({
    examAttempt: processedAttempts,
    localOverallScore
  });

  if (!output) throw new Error('Feedback generation failed');

  // 3. Merge local accuracy with AI feedback to ensure 100% data integrity
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
