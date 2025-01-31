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
import { useState } from "react"
import { SlotSettings } from "./slot-settings"
import { UsageGuidelines } from "./usage-guidelines"

export function Header() {
  const [showResetDialog, setShowResetDialog] = useState(false)
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
    const { slots, timeRanges } = createInitialSlots()
    setSchedule(prev => ({
      ...prev,
      slots,
      settings: {
        timeRanges,
        lastUpdated: new Date().toISOString(),
      },
      lastUpdated: new Date().toISOString(),
    }))
    setShowResetDialog(false)
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b bg-background/80 backdrop-blur-sm">
      <div className="container flex items-center justify-between h-14 px-4">
        <div className="flex items-center gap-2">
          <Image
            src="/logo.svg"
            alt="14 Slots Logo"
            width={24}
            height={24}
            className="rounded-md"
          />
          <h1 className="text-lg font-bold">14 Slots</h1>
        </div>
        
        <div className="flex items-center gap-2">
          <SlotSettings
            timeRanges={schedule.settings?.timeRanges || [
              { label: "오전", start: "08:00", end: "12:00" },
              { label: "오후", start: "13:00", end: "17:00" },
            ]}
            onSave={handleTimeRangesUpdate}
          />
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <div className="flex flex-col h-full">
                <SheetHeader>
                  <SheetTitle>14 Slots 사용 안내</SheetTitle>
                  <SheetDescription>
                    14개의 슬롯으로 시간을 관리하는 효율적인 시간 관리 도구입니다.
                    <p className="mt-2 text-destructive">
                      * 슬롯이 보이지 않는다면 아래의 슬롯 초기화하기를 눌러주세요.
                    </p>
                  </SheetDescription>
                </SheetHeader>

                <div className="mt-4">
                  <UsageGuidelines />
                  <div className="mt-4">
                    <a 
                      href="https://brunch.co.kr/@maxhan/61" 
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      참고 자료: 맥스의 시간관리 방법 - 브런치
                    </a>
                  </div>
                </div>

                <div className="mt-auto pt-6">
                  <Separator className="mb-6" />
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">관리자 메뉴</h3>
                    <div className="flex flex-col gap-2">
                      <Button
                        variant="outline"
                        onClick={handleDownload}
                        className="justify-start gap-2"
                      >
                        <Download className="h-4 w-4" />
                        슬롯 정보 다운로드
                      </Button>

                      <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
                        <DialogTrigger asChild>
                          <Button
                            variant="destructive"
                            className="justify-start gap-2"
                          >
                            <RefreshCcw className="h-4 w-4" />
                            슬롯 초기화하기
                          </Button>
                        </DialogTrigger>
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
                    </div>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
} 