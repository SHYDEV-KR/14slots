"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from "@/components/ui/sheet"
import { useLocalStorage } from "@/hooks/useLocalStorage"
import type { TimeRange, TimeSlot, WeekSchedule } from "@/types"
import { Download, Menu, RefreshCcw } from "lucide-react"
import Image from "next/image"
import { useState, useEffect } from "react"
import { SlotSettings } from "./slot-settings"
import { UsageGuidelines } from "./usage-guidelines"

export function Header() {
  const [showResetDialog, setShowResetDialog] = useState(false)
  const [hasStorageError, setHasStorageError] = useState(false)
  const [schedule, setSchedule] = useLocalStorage<WeekSchedule>("schedule", {
    slots: [],
    morningRoutines: [],
    eveningRoutines: [],
    lastUpdated: new Date().toISOString(),
    settings: {
      timeRanges: [
        { label: "오전", start: "08:00", end: "12:00" },
        { label: "오후", start: "13:00", end: "17:00" },
      ],
      lastUpdated: new Date().toISOString(),
    },
  })

  useEffect(() => {
    try {
      const scheduleStr = localStorage.getItem("schedule")
      if (scheduleStr) {
        const parsedSchedule = JSON.parse(scheduleStr)
        // 필수 필드 체크
        if (!parsedSchedule.slots || !parsedSchedule.settings || !parsedSchedule.settings.timeRanges) {
          setHasStorageError(true)
        }
      }
    } catch (error) {
      setHasStorageError(true)
    }
  }, [])

  const handleDownload = () => {
    const scheduleStr = localStorage.getItem("schedule")
    if (!scheduleStr) return

    const schedule = JSON.parse(scheduleStr)
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

  const handleTimeRangesUpdate = (timeRanges: TimeRange[]) => {
    const days = ["월", "화", "수", "목", "금", "토", "일"]
    const slots: TimeSlot[] = []
    let slotId = 0

    // 기존 슬롯의 정보를 저장
    const slotInfoMap = new Map<string, Partial<TimeSlot>>()
    schedule.slots.forEach(slot => {
      const key = `${slot.day}-${slot.period}`
      slotInfoMap.set(key, {
        title: slot.title,
        note: slot.note,
        category: slot.category,
        checklist: slot.checklist,
      })
    })

    // 새로운 시간대로 슬롯 생성하면서 기존 정보 유지
    for (const day of days) {
      for (const timeRange of timeRanges) {
        const key = `${day}-${timeRange.label}`
        const existingInfo = slotInfoMap.get(key)

        slots.push({
          id: slotId++,
          day,
          period: timeRange.label,
          title: existingInfo?.title || "",
          note: existingInfo?.note || "",
          category: existingInfo?.category || "unassigned",
          checklist: existingInfo?.checklist || [],
          timeRange,
        })
      }
    }

    const newSchedule = {
      ...schedule,
      slots,
      settings: {
        timeRanges,
        lastUpdated: new Date().toISOString(),
      },
      lastUpdated: new Date().toISOString(),
    }

    // 로컬 스토리지 업데이트
    localStorage.setItem("schedule", JSON.stringify(newSchedule))
    
    // 상태 업데이트
    setSchedule(newSchedule)

    // 변경 이벤트 발생
    window.dispatchEvent(new Event('schedule-updated'))

    // 페이지 리로드
    window.location.reload()
  }

  const createInitialSlots = () => {
    const days = ["월", "화", "수", "목", "금", "토", "일"]
    const defaultTimeRanges: TimeRange[] = [
      { label: "오전", start: "08:00", end: "12:00" },
      { label: "오후", start: "13:00", end: "17:00" },
    ]
    let slotId = 0
    const slots = []

    for (const day of days) {
      for (const timeRange of defaultTimeRanges) {
        slots.push({
          id: slotId++,
          day,
          period: timeRange.label,
          title: "",
          note: "",
          category: "unassigned" as const,
          checklist: [],
          timeRange,
        })
      }
    }
    return { slots, timeRanges: defaultTimeRanges }
  }

  const handleReset = () => {
    const defaultSchedule = {
      slots: [],
      morningRoutines: [],
      eveningRoutines: [],
      lastUpdated: new Date().toISOString(),
      settings: {
        timeRanges: [
          { label: "오전", start: "08:00", end: "12:00" },
          { label: "오후", start: "13:00", end: "17:00" },
        ],
        lastUpdated: new Date().toISOString(),
      },
    }
    setSchedule(defaultSchedule)
    setShowResetDialog(false)
    setHasStorageError(false)
    window.location.reload()
  }

  return (
    <header className="fixed top-0 left-0 right-0 h-16 border-b bg-background/80 backdrop-blur-sm z-50">
      <div className="container h-full max-w-4xl mx-auto px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Image
            src="/logo.png"
            alt="14 Slots"
            width={32}
            height={32}
            className="rounded-lg"
          />
          <span className="font-bold">14 Slots</span>
        </div>

        <div className="flex items-center gap-2">
          {hasStorageError && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowResetDialog(true)}
            >
              슬롯 초기화 필요
            </Button>
          )}
          <SlotSettings
            timeRanges={schedule.settings?.timeRanges || []}
            onSave={handleTimeRangesUpdate}
          />
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>메뉴</SheetTitle>
                <SheetDescription>
                  14 Slots 설정 및 기타 기능
                </SheetDescription>
              </SheetHeader>
              <div className="py-4">
                <Button
                  variant="outline"
                  onClick={handleDownload}
                  className="w-full justify-start"
                >
                  <Download className="mr-2 h-4 w-4" />
                  데이터 백업
                </Button>
              </div>
              <Separator />
              <div className="py-4">
                <UsageGuidelines />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>슬롯 초기화</DialogTitle>
            <DialogDescription>
              모든 슬롯 데이터가 초기화됩니다. 계속하시겠습니까?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowResetDialog(false)}>
              취소
            </Button>
            <Button variant="destructive" onClick={handleReset}>
              초기화
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </header>
  )
} 