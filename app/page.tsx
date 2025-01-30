"use client"

import { ScheduleGrid } from "../components/schedule-grid"
import { UsageGuidelines } from "../components/usage-guidelines"
import { MemoPad } from "../components/memo-pad"
import { CurrentSlotInfo } from "../components/current-slot-info"
import { useLocalStorage } from "../hooks/useLocalStorage"
import type { WeekSchedule, SlotCategory } from "@/types"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { Clock, Download, RefreshCcw, Settings } from "lucide-react"

export default function HomePage() {
  const [schedule, setSchedule] = useLocalStorage<WeekSchedule>("schedule", {
    slots: [],
    morningRoutines: [],
    eveningRoutines: [],
    lastUpdated: new Date().toISOString(),
  })
  const [showResetDialog, setShowResetDialog] = useState(false)
  const [showAdminButtons, setShowAdminButtons] = useState(false)

  const getCurrentSlot = () => {
    const now = new Date()
    const days = ["일", "월", "화", "수", "목", "금", "토"]
    const currentDay = days[now.getDay()]
    const hour = now.getHours()
    const period = hour >= 2 && hour < 12 ? "morning" : "afternoon"

    return schedule.slots.find(
      slot => slot.day === currentDay && slot.period === period
    )
  }

  const handleDownload = () => {
    const dataStr = JSON.stringify(schedule, null, 2)
    const blob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `14slots-backup-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const createInitialSlots = () => {
    const days = ["월", "화", "수", "목", "금", "토", "일"]
    const periods = ["morning", "afternoon"] as const
    let slotId = 0
    const slots = []

    for (const day of days) {
      for (const period of periods) {
        slots.push({
          id: slotId++,
          day,
          period,
          title: "",
          note: "",
          category: "unassigned" as SlotCategory,
          checklist: []
        })
      }
    }
    return slots
  }

  const handleReset = () => {
    setSchedule({
      ...schedule,
      slots: createInitialSlots(),
      lastUpdated: new Date().toISOString(),
    })
    setShowResetDialog(false)
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto py-12 px-4 space-y-8">
        <div className="flex flex-col items-center space-y-6 text-center">
          <div className="flex items-center gap-2">
            <Clock className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold tracking-tight">14 Slots</h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-[600px]">
            14개의 슬롯으로 시간을 관리하는 효율적인 시간 관리 도구입니다.
          </p>
          <UsageGuidelines />
          <a 
            href="https://brunch.co.kr/@maxhan/61" 
            className="text-sm text-muted-foreground hover:text-primary transition-colors"
            target="_blank" 
            rel="noopener noreferrer"
          >
            참고 자료: 맥스의 시간관리 방법 - 브런치
          </a>
        </div>

        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <CurrentSlotInfo currentSlot={getCurrentSlot()} />
        </div>

        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <ScheduleGrid 
            schedule={schedule}
            setSchedule={setSchedule}
          />
        </div>

        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <MemoPad />
        </div>

        <div className="flex justify-center">
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground"
            onClick={() => setShowAdminButtons(!showAdminButtons)}
          >
            <Settings className="w-4 h-4 mr-2" />
            {showAdminButtons ? "관리자 메뉴 숨기기" : "관리자 메뉴 보기"}
          </Button>
        </div>

        {showAdminButtons && (
          <div className="flex justify-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              슬롯 정보 다운로드
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowResetDialog(true)}
              className="gap-2"
            >
              <RefreshCcw className="w-4 h-4" />
              슬롯 초기화하기
            </Button>
          </div>
        )}
      </div>

      <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>슬롯 초기화 확인</DialogTitle>
            <DialogDescription>
              정말로 모든 슬롯 정보를 초기화하시겠습니까? 이 작업은 되돌릴 수 없습니다.
              루틴 정보는 유지됩니다.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setShowResetDialog(false)}>
              취소
            </Button>
            <Button variant="destructive" onClick={handleReset}>
              초기화
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  )
}

