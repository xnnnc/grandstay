"use client"

import * as React from "react"
import { Sun, Moon } from "@phosphor-icons/react"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useTheme } from "next-themes"
import { DashboardBreadcrumb } from "@/components/layout/breadcrumb"

function ModeToggle() {
  const { setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const handleToggle = (e: React.MouseEvent) => {
    const newTheme = resolvedTheme === "dark" ? "light" : "dark"

    if (!document.startViewTransition) {
      setTheme(newTheme)
      return
    }

    const x = e.clientX
    const y = e.clientY
    document.documentElement.style.setProperty("--click-x", `${x}px`)
    document.documentElement.style.setProperty("--click-y", `${y}px`)

    document.startViewTransition(() => {
      setTheme(newTheme)
    })
  }

  const isDark = mounted && resolvedTheme === "dark"

  return (
    <Button
      variant="ghost"
      size="icon"
      className="theme-toggle h-8 w-8 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted"
      onClick={handleToggle}
      aria-pressed={isDark}
      aria-label="Toggle theme"
    >
      <span
        className={`theme-toggle-icon ${isDark ? "rotate-0 scale-100" : "-rotate-12 scale-95"}`}
      >
        {isDark ? <Moon size={16} weight="fill" /> : <Sun size={16} weight="fill" />}
      </span>
    </Button>
  )
}

function DateDisplay() {
  const [now, setNow] = React.useState<Date | null>(null)

  React.useEffect(() => {
    setNow(new Date())
    const interval = setInterval(() => setNow(new Date()), 60000)
    return () => clearInterval(interval)
  }, [])

  if (!now) return null

  const formatted = now.toLocaleDateString("tr-TR", {
    weekday: "short",
    day: "numeric",
    month: "short",
  })

  const time = now.toLocaleTimeString("tr-TR", {
    hour: "2-digit",
    minute: "2-digit",
  })

  return (
    <div className="header-clock hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
      <span className="tabular-nums">{formatted}</span>
      <Separator orientation="vertical" className="header-divider h-3 !self-auto bg-border/80" />
      <span className="font-medium text-foreground tabular-nums">{time}</span>
    </div>
  )
}

export function DashboardHeader() {
  return (
    <header className="header-shell sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-border/60 bg-background/95 backdrop-blur-sm px-4">
      {/* Left: sidebar toggle + breadcrumb */}
      <div className="header-left flex items-center gap-2 min-w-0 flex-1">
        <SidebarTrigger className="shrink-0 text-muted-foreground hover:text-foreground transition-colors" />
        <Separator orientation="vertical" className="header-divider h-5 !self-auto bg-border/80 shrink-0" />
        <DashboardBreadcrumb />
      </div>

      {/* Right: date + theme toggle */}
      <div className="header-right flex items-center gap-2 shrink-0">
        <DateDisplay />
        <ModeToggle />
      </div>
    </header>
  )
}
