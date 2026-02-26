"use client"

import { useEffect, useState } from "react"
import { useAppStore, UserProfile, ExamRecord } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  PlusCircle, 
  TrendingUp, 
  Target, 
  History, 
  AlertCircle,
  Trophy,
  ArrowRight
} from "lucide-react"
import Link from "next/link"
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts"

export default function DashboardPage() {
  const { getUser, getExams } = useAppStore()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [exams, setExams] = useState<ExamRecord[]>([])

  useEffect(() => {
    setUser(getUser())
    setExams(getExams().sort((a, b) => b.timestamp - a.timestamp))
  }, [])

  if (!user) return null

  const chartData = exams
    .slice(0, 5)
    .reverse()
    .map(e => ({
      name: new Date(e.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      score: e.result?.overallScore || 0
    }))

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, {user.name}</h1>
          <p className="text-muted-foreground">Here&apos;s your preparation status for banking exams.</p>
        </div>
        <Button asChild className="bg-accent hover:bg-accent/80">
          <Link href="/exam/new">
            <PlusCircle className="mr-2 h-4 w-4" /> New Mock Exam
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="glass-morphism border-white/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Average Score</CardTitle>
            <Trophy className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(user.averageScore)}%</div>
            <p className="text-xs text-muted-foreground">
              Across {user.totalExams} mock exams
            </p>
          </CardContent>
        </Card>
        <Card className="glass-morphism border-white/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Streak</CardTitle>
            <TrendingUp className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4 Days</div>
            <p className="text-xs text-muted-foreground">
              Consistency is key to SBI PO success!
            </p>
          </CardContent>
        </Card>
        <Card className="glass-morphism border-white/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Weakest Topic</CardTitle>
            <AlertCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold truncate">{user.weakTopics[0] || "None yet"}</div>
            <p className="text-xs text-muted-foreground">
              Next exam will focus here.
            </p>
          </CardContent>
        </Card>
        <Card className="glass-morphism border-white/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Current Level</CardTitle>
            <Target className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">{user.difficultyPreference}</div>
            <p className="text-xs text-muted-foreground">
              Adapts to your performance.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 glass-morphism border-white/5">
          <CardHeader>
            <CardTitle>Recent Performance</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}%`} />
                  <Tooltip 
                    cursor={{fill: 'rgba(255,255,255,0.05)'}} 
                    contentStyle={{backgroundColor: '#1A0A29', borderColor: 'rgba(255,255,255,0.1)'}}
                  />
                  <Bar dataKey="score" fill="#59288A" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-3 glass-morphism border-white/5">
          <CardHeader>
            <CardTitle>Topic Focus</CardTitle>
            <CardDescription>Areas needing immediate attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {user.weakTopics.length > 0 ? (
                user.weakTopics.map((topic, i) => (
                  <div key={topic} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-destructive border-destructive/20 bg-destructive/5">{i+1}</Badge>
                        <span className="font-medium">{topic}</span>
                      </div>
                      <span className="text-muted-foreground text-xs">Priority: High</span>
                    </div>
                    <Progress value={25 + Math.random() * 20} className="h-1.5" />
                  </div>
                ))
              ) : (
                <div className="text-center py-10 text-muted-foreground">
                  Complete a mock test to see your topic analysis!
                </div>
              )}
              
              {user.weakTopics.length > 0 && (
                <Button asChild variant="outline" className="w-full mt-4 border-accent/20 hover:bg-accent/10 hover:text-accent">
                  <Link href="/exam/new?adaptive=true">
                    Improve Weak Topics <ArrowRight className="ml-2 w-4 h-4" />
                  </Link>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight">Recent Activity</h2>
          <Button variant="ghost" asChild size="sm">
            <Link href="/dashboard/history" className="text-accent">View all</Link>
          </Button>
        </div>
        <div className="grid gap-4">
          {exams.length > 0 ? (
            exams.slice(0, 3).map((exam) => (
              <Link key={exam.id} href={`/exam/${exam.id}/results`}>
                <Card className="glass-morphism border-white/5 hover:bg-white/5 transition-colors cursor-pointer">
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <History className="text-primary w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-semibold">{exam.type} Mock Exam</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(exam.timestamp).toLocaleString()} • {exam.difficulty} difficulty
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-accent">{exam.result?.overallScore || 0}%</div>
                      <div className="text-xs text-muted-foreground">Score</div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))
          ) : (
            <Card className="glass-morphism border-white/5 p-8 text-center text-muted-foreground">
              No exams taken yet. Start your first mock test!
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}