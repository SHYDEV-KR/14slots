"use client"

import { cn } from "@/lib/utils"
import { Calendar, StickyNote } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

export function BottomNav() {
  const pathname = usePathname()

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50">
      <nav className="mx-auto max-w-md rounded-full border bg-background/95 shadow-lg backdrop-blur-sm">
        <div className="grid h-16 grid-cols-2">
          <Link
            href="/"
            className={cn(
              "flex flex-col items-center justify-center gap-1 rounded-l-full transition-colors",
              pathname === "/" 
                ? "text-primary hover:bg-primary/10" 
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <Calendar className="h-6 w-6" />
            <span className="text-xs font-medium">일정</span>
          </Link>
          <Link
            href="/memo"
            className={cn(
              "flex flex-col items-center justify-center gap-1 rounded-r-full transition-colors",
              pathname === "/memo" 
                ? "text-primary hover:bg-primary/10" 
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <StickyNote className="h-6 w-6" />
            <span className="text-xs font-medium">메모</span>
          </Link>
        </div>
      </nav>
    </div>
  )
} 