import Link from "next/link"
import { Button } from "@/components/ui/button"
import { BrainCircuit, ShieldCheck, TrendingUp, Zap, ArrowRight } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar */}
      <header className="px-4 lg:px-6 h-16 flex items-center border-b border-white/10 glass-morphism sticky top-0 z-50">
        <Link className="flex items-center justify-center space-x-2" href="/">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <BrainCircuit className="text-white w-5 h-5" />
          </div>
          <span className="text-xl font-bold tracking-tight">QuantumQuizzes <span className="text-accent">AI</span></span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link className="text-sm font-medium hover:text-accent transition-colors" href="#features">Features</Link>
          <Link className="text-sm font-medium hover:text-accent transition-colors" href="/auth/login">Login</Link>
          <Button asChild size="sm" variant="accent" className="bg-accent hover:bg-accent/80 text-white">
            <Link href="/auth/signup">Get Started</Link>
          </Button>
        </nav>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-gradient-to-b from-[#1A0A29] to-[#0D0514]">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-7xl/none max-w-4xl mx-auto leading-tight">
                  Master Bank Exams with <span className="gradient-text">Adaptive AI Intelligence</span>
                </h1>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl font-light">
                  QuantumQuizzes AI dynamically generates unique mock exams tailored specifically to your weakest topics, helping you improve faster.
                </p>
              </div>
              <div className="space-x-4 pt-4">
                <Button asChild size="lg" className="h-12 px-8 bg-accent hover:bg-accent/80 text-white text-base">
                  <Link href="/auth/signup">Start Your Free Test <ArrowRight className="ml-2 w-4 h-4" /></Link>
                </Button>
                <Button variant="outline" size="lg" className="h-12 px-8 border-primary/50 hover:bg-primary/10 text-base">
                  Explore Features
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-[#0D0514]">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
              <div className="flex flex-col items-center space-y-4 text-center p-6 rounded-2xl border border-white/5 bg-white/5 hover:bg-white/10 transition-all group">
                <div className="p-3 rounded-xl bg-primary/20 group-hover:bg-primary/40 transition-colors">
                  <Zap className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Dynamic Generation</h3>
                <p className="text-sm text-muted-foreground">
                  AI generates fresh, unique bank exam questions every time. No more repeating old papers.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4 text-center p-6 rounded-2xl border border-white/5 bg-white/5 hover:bg-white/10 transition-all group">
                <div className="p-3 rounded-xl bg-accent/20 group-hover:bg-accent/40 transition-colors">
                  <TrendingUp className="h-8 w-8 text-accent" />
                </div>
                <h3 className="text-xl font-bold">Adaptive Difficulty</h3>
                <p className="text-sm text-muted-foreground">
                  Tests grow harder as you improve, ensuring you stay in the optimal learning zone.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4 text-center p-6 rounded-2xl border border-white/5 bg-white/5 hover:bg-white/10 transition-all group">
                <div className="p-3 rounded-xl bg-blue-500/20 group-hover:bg-blue-500/40 transition-colors">
                  <ShieldCheck className="h-8 w-8 text-blue-500" />
                </div>
                <h3 className="text-xl font-bold">Weak Topic Focus</h3>
                <p className="text-sm text-muted-foreground">
                  Our algorithm identifies your weakest areas and prioritizes them in your next mock exam.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4 text-center p-6 rounded-2xl border border-white/5 bg-white/5 hover:bg-white/10 transition-all group">
                <div className="p-3 rounded-xl bg-purple-500/20 group-hover:bg-purple-500/40 transition-colors">
                  <BrainCircuit className="h-8 w-8 text-purple-500" />
                </div>
                <h3 className="text-xl font-bold">AI Feedback</h3>
                <p className="text-sm text-muted-foreground">
                  Get detailed, constructive feedback on why you missed a mark and how to solve it next time.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="w-full py-6 bg-black/40 border-t border-white/5">
        <div className="container px-4 md:px-6 mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground">
            © 2024 QuantumQuizzes AI. All rights reserved.
          </p>
          <nav className="flex gap-4 sm:gap-6">
            <Link className="text-xs hover:underline underline-offset-4 text-muted-foreground" href="#">Terms of Service</Link>
            <Link className="text-xs hover:underline underline-offset-4 text-muted-foreground" href="#">Privacy</Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}