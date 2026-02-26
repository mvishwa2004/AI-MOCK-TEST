"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { useAppStore, ExamRecord } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Loader2, Timer, ChevronRight, ChevronLeft, Send } from "lucide-react"
import { evaluateAnswersAndProvideFeedback } from "@/ai/flows/evaluate-answers-and-provide-feedback-flow"

export default function ExamSessionPage() {
  const params = useParams()
  const router = useRouter()
  const { getExams, saveExam } = useAppStore()
  
  const [exam, setExam] = useState<ExamRecord | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [timeLeft, setTimeLeft] = useState(300) // 5 minutes

  useEffect(() => {
    const allExams = getExams()
    const currentExam = allExams.find(e => e.id === params.id)
    if (!currentExam) {
      router.push("/dashboard")
      return
    }
    setExam(currentExam)
    setTimeLeft(currentExam.questions.length * 60) // 1 minute per question
  }, [params.id])

  useEffect(() => {
    if (timeLeft <= 0) {
      handleSubmit()
      return
    }
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [timeLeft])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleSelectAnswer = (ans: string) => {
    const questionId = exam!.questions[currentIndex].questionId
    setAnswers(prev => ({ ...prev, [questionId]: ans }))
  }

  const handleSubmit = async () => {
    if (!exam || submitting) return
    setSubmitting(true)

    try {
      const evaluationInput = exam.questions.map(q => ({
        questionText: q.questionText,
        correctAnswer: q.correctAnswer,
        studentAnswer: answers[q.questionId] || "No answer provided",
        topic: q.topic
      }))

      const result = await evaluateAnswersAndProvideFeedback({
        examAttempt: evaluationInput
      })

      const updatedExam = {
        ...exam,
        answers,
        result
      }

      saveExam(updatedExam)
      router.push(`/exam/${exam.id}/results`)
    } catch (error) {
      console.error(error)
      alert("Submission failed. Retrying...")
    } finally {
      setSubmitting(false)
    }
  }

  if (!exam) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>

  const q = exam.questions[currentIndex]
  const progress = ((currentIndex + 1) / exam.questions.length) * 100

  return (
    <div className="min-h-screen bg-[#0D0514] p-4 md:p-8 flex flex-col items-center">
      <div className="w-full max-w-4xl flex flex-col gap-6">
        <header className="flex justify-between items-center glass-morphism p-4 rounded-xl border-white/10">
          <div>
            <h1 className="text-xl font-bold">{exam.type} Mock Exam</h1>
            <p className="text-xs text-muted-foreground">Progress: Question {currentIndex + 1} of {exam.questions.length}</p>
          </div>
          <div className="flex items-center gap-2 text-accent font-mono text-xl">
            <Timer className="w-5 h-5" />
            {formatTime(timeLeft)}
          </div>
        </header>

        <Progress value={progress} className="h-2" />

        <Card className="glass-morphism border-white/10">
          <CardHeader>
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-semibold px-2 py-1 bg-primary/20 text-primary rounded uppercase tracking-wider">
                {q.topic}
              </span>
              <span className="text-xs text-muted-foreground uppercase">Difficulty: {q.difficulty}</span>
            </div>
            <CardTitle className="text-xl font-medium leading-relaxed">
              {q.questionText}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup value={answers[q.questionId]} onValueChange={handleSelectAnswer} className="space-y-3">
              {q.options.map((option, i) => {
                const label = String.fromCharCode(65 + i) // A, B, C, D
                return (
                  <div key={i} className="flex items-center space-x-2">
                    <RadioGroupItem value={label} id={`opt-${i}`} className="sr-only peer" />
                    <Label
                      htmlFor={`opt-${i}`}
                      className="flex-1 p-4 rounded-lg border border-white/5 bg-white/5 hover:bg-white/10 peer-data-[state=checked]:border-accent peer-data-[state=checked]:bg-accent/10 transition-all cursor-pointer flex items-center gap-3"
                    >
                      <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center font-bold text-sm">
                        {label}
                      </span>
                      {option}
                    </Label>
                  </div>
                )
              })}
            </RadioGroup>
          </CardContent>
        </Card>

        <div className="flex justify-between items-center mt-4">
          <Button 
            variant="ghost" 
            onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
            disabled={currentIndex === 0}
            className="text-muted-foreground hover:text-white"
          >
            <ChevronLeft className="mr-2 w-4 h-4" /> Previous
          </Button>

          {currentIndex === exam.questions.length - 1 ? (
            <Button 
              className="bg-accent hover:bg-accent/80 px-8" 
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? <Loader2 className="animate-spin mr-2" /> : <Send className="mr-2 w-4 h-4" />}
              Finish Exam
            </Button>
          ) : (
            <Button 
              className="bg-primary hover:bg-primary/90 px-8" 
              onClick={() => setCurrentIndex(prev => prev + 1)}
            >
              Next <ChevronRight className="ml-2 w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}