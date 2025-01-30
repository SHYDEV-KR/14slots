"use client"

import { ScheduleGrid } from "../components/schedule-grid"
import { UsageGuidelines } from "../components/usage-guidelines"
import { MemoPad } from "../components/memo-pad"
import { CurrentSlotInfo } from "../components/current-slot-info"
import { useLocalStorage } from "../hooks/useLocalStorage"
import type { DailyRoutine, WeekSchedule, SlotCategory } from "@/types"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useState } from "react"

export default function HomePage() {
  const [schedule, setSchedule] = useLocalStorage<WeekSchedule>("schedule", {
    slots: [],
    morningRoutines: [],
    eveningRoutines: [],
    lastUpdated: new Date().toISOString(),
  })
  const [showResetDialog, setShowResetDialog] = useState(false)
  const [showAdminButtons, setShowAdminButtons] = useState(false)

  const handleRoutineUpdate = (routineId: string, day: string, updates: { completed?: boolean; note?: string }) => {
    const updateRoutines = (routines: DailyRoutine[], setRoutines: (routines: DailyRoutine[]) => void) => {
      const updatedRoutines = routines.map(routine => {
        if (routine.id === routineId) {
          return {
            ...routine,
            dailyStatus: {
              ...routine.dailyStatus,
              [day]: {
                ...routine.dailyStatus[day],
                ...updates,
              },
            },
          }
        }
        return routine
      })
      setRoutines(updatedRoutines)
    }
  }

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
      <div className="container max-w-lg mx-auto py-8 px-4">
        <div className="flex flex-col justify-between items-center mb-8 gap-4">
          <h1 className="text-2xl font-bold">14 Slots Time Management</h1>
          <UsageGuidelines />
          <p className="text-sm text-muted-foreground">
            참고 자료: <a href="https://brunch.co.kr/@maxhan/61" className="underline hover:text-foreground" target="_blank" rel="noopener noreferrer">
              맥스의 시간관리 방법 - 브런치
            </a>
          </p>
        </div>
        <CurrentSlotInfo 
          currentSlot={getCurrentSlot()} 
        />
        <ScheduleGrid 
          schedule={schedule}
          setSchedule={setSchedule}
        />
        <MemoPad />
        <div className="mt-8 text-center">
          <Button
            variant="ghost"
            className="text-xs text-muted-foreground hover:text-foreground"
            onClick={() => setShowAdminButtons(!showAdminButtons)}
          >
            {showAdminButtons ? "관리자 메뉴 숨기기" : "관리자 메뉴 보기"}
          </Button>
          {showAdminButtons && (
            <div className="mt-4 space-x-4">
              <Button
                variant="outline"
                onClick={handleDownload}
                className="text-sm"
              >
                슬롯 정보 다운로드
              </Button>
              <Button
                variant="destructive"
                onClick={() => setShowResetDialog(true)}
                className="text-sm"
              >
                슬롯 초기화하기
              </Button>
            </div>
          )}
        </div>
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

