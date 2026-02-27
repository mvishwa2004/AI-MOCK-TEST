'use server';
/**
 * @fileOverview Evaluates student answers with robust string comparison
 * and generates qualitative AI feedback.
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
  detailedFeedback: z.string().describe('Short explanation of why the answer was correct or incorrect.'),
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
  prompt: `You are an expert bank exam coach. I have already calculated the raw scores.
  
Student Score: {{localOverallScore}}%

Your task is to provide the qualitative layer of feedback. 

Provide:
1. 'overallFeedback': A motivational summary.
2. 'topicAnalysis': Performance per topic.
3. 'weakestTopics': Identify topics where performance was low.
4. 'detailedFeedback' for each question: Explain the logic briefly.

Here is the attempt data:
{{#each examAttempt}}
- Topic: {{{topic}}}
- Question: {{{questionText}}}
- Student Answer: {{{studentAnswer}}}
- Correct Answer: {{{correctAnswer}}}
- Result: {{#if isCorrect}}Correct{{else}}Incorrect{{/if}}
{{/each}}`,
});

/**
 * Robustly cleans an answer string for comparison.
 * Removes "Option ", "A.", whitespace, and converts to uppercase.
 */
function cleanAnswer(ans: string): string {
  if (!ans) return "";
  return ans
    .replace(/^option\s+/i, "")
    .replace(/^([A-D])\./i, "$1")
    .trim()
    .toUpperCase()
    .charAt(0); // Take only the first character (A, B, C, or D)
}

export async function evaluateAnswersAndProvideFeedback(
  input: EvaluateAnswersAndProvideFeedbackInput
): Promise<EvaluateAnswersAndProvideFeedbackOutput> {
  // 1. Calculate accuracy deterministically with robust cleaning
  const processedAttempts = input.examAttempt.map(attempt => {
    const studentAnsClean = cleanAnswer(attempt.studentAnswer);
    const correctAnsClean = cleanAnswer(attempt.correctAnswer);
    
    return {
      ...attempt,
      isCorrect: studentAnsClean !== "" && studentAnsClean === correctAnsClean,
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

  // 3. Merge local accuracy with AI feedback to ensure data integrity
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
