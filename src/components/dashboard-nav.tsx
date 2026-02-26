"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { 
  LayoutDashboard, 
  FileText, 
  Settings, 
  History, 
  LogOut, 
  BrainCircuit,
  PieChart
} from "lucide-react"

const items = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Mock Tests",
    href: "/exam/new",
    icon: FileText,
  },
  {
    title: "Performance",
    href: "/dashboard/performance",
    icon: PieChart,
  },
  {
    title: "History",
    href: "/dashboard/history",
    icon: History,
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
]

export function DashboardNav() {
  const pathname = usePathname()

  return (
    <nav className="flex flex-col h-full bg-sidebar border-r border-sidebar-border px-4 py-6 w-64 shrink-0">
      <div className="flex items-center space-x-2 px-2 mb-10">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
          <BrainCircuit className="text-white w-5 h-5" />
        </div>
        <span className="text-lg font-bold">QuantumQuizzes</span>
      </div>
      
      <div className="space-y-1">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors",
              pathname === item.href
                ? "bg-primary text-white"
                : "text-muted-foreground hover:bg-sidebar-accent hover:text-white"
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.title}
          </Link>
        ))}
      </div>

      <div className="mt-auto">
        <Link
          href="/auth/login"
          className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-red-400 hover:bg-red-400/10 rounded-md transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Link>
      </div>
    </nav>
  )
}