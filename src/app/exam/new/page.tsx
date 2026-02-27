"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAppStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Loader2, Zap, BrainCircuit, Target } from "lucide-react"
import { generateMockExamQuestions } from "@/ai/flows/generate-mock-exam-questions-flow"
import { generateAdaptiveMockExam } from "@/ai/flows/generate-adaptive-mock-exam"

export default function NewExamPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { getUser, saveUser, getExams, saveExam } = useAppStore()
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  
  const [examType, setExamType] = useState("SBI PO")
  const [difficulty, setDifficulty] = useState("medium")
  const [numQuestions, setNumQuestions] = useState("5")
  const [isAdaptive, setIsAdaptive] = useState(false)

  useEffect(() => {
    setMounted(true)
    const adaptiveParam = searchParams.get("adaptive")
    if (adaptiveParam === "true") {
      setIsAdaptive(true)
    }
    const user = getUser()
    if (user && user.difficultyPreference) {
      setDifficulty(user.difficultyPreference)
    }
  }, [searchParams])

  const handleStart = async () => {
    setLoading(true)
    try {
      const user = getUser()
      let questionsResult
      
      if (isAdaptive) {
        questionsResult = await generateAdaptiveMockExam({
          studentId: user.id,
          weakestTopics: user.weakTopics,
          numQuestions: parseInt(numQuestions),
          difficultyLevel: difficulty as any
        })
        // Format adaptive output to match standard question schema
        questionsResult = {
          questions: questionsResult.examQuestions.map((q, i) => ({
            questionId: `Q-${i}-${Date.now()}`,
            questionText: q.question,
            options: q.options,
            correctAnswer: q.correctAnswer,
            explanation: "Review based on topic " + q.topic,
            topic: q.topic,
            difficulty: difficulty as any
          }))
        }
      } else {
        questionsResult = await generateMockExamQuestions({
          studentId: user.id,
          examType,
          numQuestions: parseInt(numQuestions),
          difficultyLevel: difficulty as any,
          weakTopics: user.weakTopics,
          strongTopics: user.strongTopics
        })
      }

      const examId = Math.random().toString(36).substring(7)
      saveExam({
        id: examId,
        type: examType,
        difficulty,
        timestamp: Date.now(),
        questions: questionsResult.questions,
        answers: {}
      })

      router.push(`/exam/${examId}`)
    } catch (error) {
      console.error(error)
      alert("Failed to generate exam. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (!mounted) {
    return (
      <div className="container max-w-2xl mx-auto py-10 px-4 flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="container max-w-2xl mx-auto py-10 px-4">
      <Card className="glass-morphism border-white/10" suppressHydrationWarning>
        <CardHeader className="text-center">
          <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mx-auto mb-4">
            <Zap className="text-primary w-6 h-6" />
          </div>
          <CardTitle className="text-2xl">Configure Mock Exam</CardTitle>
          <CardDescription>Our AI will generate unique questions just for you.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Mode</Label>
            <RadioGroup 
              value={isAdaptive ? "adaptive" : "standard"} 
              onValueChange={(val) => setIsAdaptive(val === "adaptive")}
              className="grid grid-cols-2 gap-4"
            >
              <div>
                <RadioGroupItem value="standard" id="standard" className="peer sr-only" />
                <Label
                  htmlFor="standard"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary transition-all cursor-pointer"
                >
                  <Target className="mb-3 h-6 w-6" />
                  <span className="text-sm font-medium">Standard</span>
                  <span className="text-xs text-muted-foreground text-center mt-1">General curriculum coverage</span>
                </Label>
              </div>
              <div>
                <RadioGroupItem value="adaptive" id="adaptive" className="peer sr-only" />
                <Label
                  htmlFor="adaptive"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary transition-all cursor-pointer"
                >
                  <BrainCircuit className="mb-3 h-6 w-6" />
                  <span className="text-sm font-medium">Adaptive</span>
                  <span className="text-xs text-muted-foreground text-center mt-1">Focus on weak topics</span>
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="exam-type">Exam Target</Label>
              <Select value={examType} onValueChange={setExamType}>
                <SelectTrigger id="exam-type" className="bg-background/50 border-white/10">
                  <SelectValue placeholder="Select target" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SBI PO">SBI PO</SelectItem>
                  <SelectItem value="IBPS Clerk">IBPS Clerk</SelectItem>
                  <SelectItem value="RBI Grade B">RBI Grade B</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="difficulty">Difficulty</Label>
              <Select value={difficulty} onValueChange={setDifficulty}>
                <SelectTrigger id="difficulty" className="bg-background/50 border-white/10">
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Beginner</SelectItem>
                  <SelectItem value="medium">Intermediate</SelectItem>
                  <SelectItem value="hard">Expert</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="num-questions">Number of Questions</Label>
            <Select value={numQuestions} onValueChange={setNumQuestions}>
              <SelectTrigger id="num-questions" className="bg-background/50 border-white/10">
                <SelectValue placeholder="Select amount" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 Questions (Fast)</SelectItem>
                <SelectItem value="10">10 Questions (Standard)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            className="w-full h-12 text-lg bg-primary hover:bg-primary/90" 
            onClick={handleStart}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" /> 
                AI is Crafting Your Exam...
              </>
            ) : "Generate & Start Test"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
