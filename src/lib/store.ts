"use client"

import { GenerateMockExamQuestionsOutput } from "@/ai/flows/generate-mock-exam-questions-flow"
import { EvaluateAnswersAndProvideFeedbackOutput } from "@/ai/flows/evaluate-answers-and-provide-feedback-flow"

export interface UserProfile {
  id: string
  name: string
  email: string
  weakTopics: string[]
  strongTopics: string[]
  averageScore: number
  totalExams: number
  difficultyPreference: 'easy' | 'medium' | 'hard'
}

export interface ExamRecord {
  id: string
  type: string
  difficulty: string
  timestamp: number
  questions: GenerateMockExamQuestionsOutput['questions']
  answers: Record<string, string>
  result?: EvaluateAnswersAndProvideFeedbackOutput
}

const STORAGE_KEY_USER = "quantum_quizzes_user"
const STORAGE_KEY_EXAMS = "quantum_quizzes_exams"

const DEFAULT_USER: UserProfile = {
  id: "student_1",
  name: "John Candidate",
  email: "john@example.com",
  weakTopics: ["Quantitative Aptitude", "Data Interpretation"],
  strongTopics: ["Reasoning Ability", "English Language"],
  averageScore: 0,
  totalExams: 0,
  difficultyPreference: 'medium'
}

export const useAppStore = () => {
  const getUser = (): UserProfile => {
    if (typeof window === 'undefined') return DEFAULT_USER
    const saved = localStorage.getItem(STORAGE_KEY_USER)
    return saved ? JSON.parse(saved) : DEFAULT_USER
  }

  const saveUser = (user: UserProfile) => {
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user))
  }

  const getExams = (): ExamRecord[] => {
    if (typeof window === 'undefined') return []
    const saved = localStorage.getItem(STORAGE_KEY_EXAMS)
    return saved ? JSON.parse(saved) : []
  }

  const saveExam = (exam: ExamRecord) => {
    const exams = getExams()
    const index = exams.findIndex(e => e.id === exam.id)
    if (index > -1) {
      exams[index] = exam
    } else {
      exams.push(exam)
    }
    localStorage.setItem(STORAGE_KEY_EXAMS, JSON.stringify(exams))

    // Update user stats if result is present
    if (exam.result) {
      const user = getUser()
      const allExams = getExams().filter(e => !!e.result)
      const totalScore = allExams.reduce((acc, e) => acc + (e.result?.overallScore || 0), 0)
      
      user.totalExams = allExams.length
      user.averageScore = totalScore / allExams.length
      user.weakTopics = exam.result.weakestTopics
      // Simplified update for strong topics: anything not in weakest but performed > 70%
      const newStrong = exam.result.topicAnalysis
        .filter(t => t.performancePercentage > 70 && !user.weakTopics.includes(t.topic))
        .map(t => t.topic)
      
      user.strongTopics = Array.from(new Set([...user.strongTopics, ...newStrong]))
      
      // Adaptive Difficulty
      if (exam.result.overallScore > 80 && user.difficultyPreference !== 'hard') {
        user.difficultyPreference = user.difficultyPreference === 'easy' ? 'medium' : 'hard'
      } else if (exam.result.overallScore < 40 && user.difficultyPreference !== 'easy') {
        user.difficultyPreference = user.difficultyPreference === 'hard' ? 'medium' : 'easy'
      }

      saveUser(user)
    }
  }

  return { getUser, saveUser, getExams, saveExam }
}