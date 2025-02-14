"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import React from "react"
import type { DailyRoutine, SlotCategory, TimeRange, TimeSlot, WeekSchedule } from "../types"
import { Checklist } from "./checklist"
import { RoutineManager } from "./routine-manager"

const DAYS = ["월", "화", "수", "목", "금", "토", "일"]
const DEFAULT_TIME_RANGES = [
  { label: "오전", start: "08:00", end: "12:00" },
  { label: "오후", start: "12:00", end: "18:00" },
]

const CATEGORIES: Record<SlotCategory, { name: string; color: string; bgClass: string; hoverClass: string }> = {
  personal: { 
    name: "개인 충전/회복", 
    color: "text-blue-500",
    bgClass: "bg-blue-500/10 dark:bg-blue-500/20",
    hoverClass: "hover:bg-blue-500/20 dark:hover:bg-blue-500/30"
  },
  family: { 
    name: "가족/연인", 
    color: "text-pink-500",
    bgClass: "bg-pink-500/10 dark:bg-pink-500/20",
    hoverClass: "hover:bg-pink-500/20 dark:hover:bg-pink-500/30"
  },
  team: { 
    name: "팀원 관리", 
    color: "text-purple-500",
    bgClass: "bg-purple-500/10 dark:bg-purple-500/20",
    hoverClass: "hover:bg-purple-500/20 dark:hover:bg-purple-500/30"
  },
  organization: { 
    name: "조직 문화/시스템", 
    color: "text-yellow-500",
    bgClass: "bg-yellow-500/10 dark:bg-yellow-500/20",
    hoverClass: "hover:bg-yellow-500/20 dark:hover:bg-yellow-500/30"
  },
  strategy: { 
    name: "전략/방향", 
    color: "text-green-500",
    bgClass: "bg-green-500/10 dark:bg-green-500/20",
    hoverClass: "hover:bg-green-500/20 dark:hover:bg-green-500/30"
  },
  business: { 
    name: "고객/사업개발", 
    color: "text-orange-500",
    bgClass: "bg-orange-500/10 dark:bg-orange-500/20",
    hoverClass: "hover:bg-orange-500/20 dark:hover:bg-orange-500/30"
  },
  unassigned: { 
    name: "미지정", 
    color: "text-gray-500",
    bgClass: "bg-gray-500/10 dark:bg-gray-500/20",
    hoverClass: "hover:bg-gray-500/20 dark:hover:bg-gray-500/30"
  },
}

const RECOMMENDED_SLOTS = {
  personal: { min: 2, max: 2, name: "개인 충전/회복", description: "2개" },
  family: { min: 1, max: 2, name: "가족/연인", description: "1-2개" },
  team: { min: 1, max: 1, name: "팀원 관리", description: "1개" },
  organization: { min: 1, max: 1, name: "조직 문화/시스템", description: "1개" },
  strategy: { min: 1, max: 1, name: "전략/방향", description: "1개" },
  business: { min: 6, max: 8, name: "고객/사업개발", description: "6-8개" },
}

interface ScheduleGridProps {
  schedule: WeekSchedule
  setSchedule: (schedule: WeekSchedule) => void
}

// 슬롯 내부 컨텐츠 컴포넌트 추가
function SlotContent({ slot, timeRange }: { slot: TimeSlot; timeRange: TimeRange }) {
  if (slot.checklist.length > 0) {
    return (
      <div className="text-sm font-medium">
        {slot.checklist.filter((item) => item.completed).length}/{slot.checklist.length}
      </div>
    )
  }

  if (slot.category !== "unassigned") {
    return (
      <div className="text-sm font-medium line-clamp-2 text-center break-keep">
        0/0
      </div>
    )
  }

  return (
    <div className="text-sm font-medium opacity-50">
      {timeRange.label}
    </div>
  )
}

function SlotUsageChart({ slots }: { slots: TimeSlot[] }) {
  const usage = Object.entries(CATEGORIES).reduce((acc, [category]) => {
    acc[category as SlotCategory] = slots.filter(slot => slot.category === category).length
    return acc
  }, {} as Record<SlotCategory, number>)

  return (
    <div className="space-y-6 mt-8 p-6 rounded-xl border bg-card">
      <h3 className="text-lg font-semibold">슬롯 사용 현황</h3>
      <div className="space-y-4">
        {Object.entries(RECOMMENDED_SLOTS).map(([category, recommendation]) => {
          const count = usage[category as SlotCategory] || 0
          const percentage = (count / (recommendation.max || 1)) * 100
          const isWithinRange = count >= recommendation.min && count <= recommendation.max
          
          return (
            <div key={category} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className={CATEGORIES[category as SlotCategory].color}>
                  {CATEGORIES[category as SlotCategory].name}
                </span>
                <span className="text-muted-foreground">
                  {count}개 / 권장 {recommendation.description}
                </span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    isWithinRange ? "bg-green-500" : "bg-yellow-500"
                  }`}
                  style={{ width: `${Math.min(100, percentage)}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
      <p className="text-sm text-muted-foreground mt-4">
        * 균형 잡힌 시간 관리를 위해 권장 슬롯 수를 참고해 주세요.
      </p>
    </div>
  )
}

export function ScheduleGrid({
  schedule,
  setSchedule,
}: ScheduleGridProps) {
  const today = new Date().getDay()
  const koreanDayIndex = today === 0 ? 6 : today - 1
  const currentHour = new Date().getHours()
  const currentMinute = new Date().getMinutes()
  const currentTime = `${currentHour.toString().padStart(2, "0")}:${currentMinute.toString().padStart(2, "0")}`

  const isCurrentSlot = (slot: TimeSlot) => {
    const dayIndex = DAYS.indexOf(slot.day)
    if (dayIndex !== koreanDayIndex) return false
    
    const start = slot.timeRange.start
    const end = slot.timeRange.end
    return currentTime >= start && currentTime <= end
  }

  const updateSlot = (slotId: number, updates: Partial<TimeSlot>) => {
    const newSchedule: WeekSchedule = {
      ...schedule,
      slots: schedule.slots.map((slot) => (slot.id === slotId ? { ...slot, ...updates } : slot)),
      lastUpdated: new Date().toISOString(),
    }
    setSchedule(newSchedule)
  }

  const addRoutine = (type: "morning" | "evening") => (text: string) => {
    const routine: DailyRoutine = {
      id: crypto.randomUUID(),
      text: text.trim(),
      note: "",
      dailyStatus: {}
    }
    const currentRoutines = schedule[type === "morning" ? "morningRoutines" : "eveningRoutines"] || []
    const newSchedule: WeekSchedule = {
      ...schedule,
      [type === "morning" ? "morningRoutines" : "eveningRoutines"]: [
        ...currentRoutines,
        routine
      ],
      lastUpdated: new Date().toISOString(),
    }
    setSchedule(newSchedule)
  }

  const removeRoutine = (type: "morning" | "evening") => (id: string) => {
    const currentRoutines = schedule[type === "morning" ? "morningRoutines" : "eveningRoutines"] || []
    const newSchedule: WeekSchedule = {
      ...schedule,
      [type === "morning" ? "morningRoutines" : "eveningRoutines"]: currentRoutines.filter(routine => routine.id !== id),
      lastUpdated: new Date().toISOString(),
    }
    setSchedule(newSchedule)
  }

  const updateRoutineStatus = (type: "morning" | "evening") => (
    routineId: string,
    date: string,
    updates: { completed?: boolean; completedAt?: string; note?: string }
  ) => {
    const currentRoutines = schedule[type === "morning" ? "morningRoutines" : "eveningRoutines"] || []
    const newSchedule: WeekSchedule = {
      ...schedule,
      [type === "morning" ? "morningRoutines" : "eveningRoutines"]: currentRoutines.map(routine =>
        routine.id === routineId
          ? {
              ...routine,
              note: updates.note !== undefined ? updates.note : routine.note,
              dailyStatus: {
                ...routine.dailyStatus,
                [date]: {
                  ...routine.dailyStatus[date],
                  completed: updates.completed,
                  completedAt: updates.completedAt,
                }
              }
            }
          : routine
      ),
      lastUpdated: new Date().toISOString(),
    }
    setSchedule(newSchedule)
  }

  // 슬롯이 비어있을 때 초기화
  React.useEffect(() => {
    if (schedule.slots.length === 0) {
      const days = ["월", "화", "수", "목", "금", "토", "일"]
      const slots: TimeSlot[] = []
      let slotId = 0

      const timeRanges = schedule.settings?.timeRanges || DEFAULT_TIME_RANGES

      for (const day of days) {
        for (const timeRange of timeRanges) {
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

      const newSchedule: WeekSchedule = {
        slots,
        morningRoutines: schedule.morningRoutines,
        eveningRoutines: schedule.eveningRoutines,
        settings: {
          ...schedule.settings,
          timeRanges,
          lastUpdated: new Date().toISOString(),
        },
        lastUpdated: new Date().toISOString(),
      }
      setSchedule(newSchedule)
    }
  }, [schedule.slots.length, setSchedule, schedule.morningRoutines, schedule.eveningRoutines, schedule.settings])

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-7 gap-3">
        {/* Days header */}
        {DAYS.map((day, index) => (
          <div
            key={day}
            className={`text-center font-medium p-2 rounded-lg ${
              index === koreanDayIndex
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground"
            }`}
          >
            {day}
          </div>
        ))}

        {/* Morning Routines */}
        <RoutineManager
          title="시작 루틴"
          routines={schedule.morningRoutines}
          onRoutineAdd={addRoutine("morning")}
          onRoutineRemove={removeRoutine("morning")}
          onRoutineUpdate={updateRoutineStatus("morning")}
          buttonClassName="col-span-7 h-16 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 hover:bg-amber-500/20 dark:hover:bg-amber-500/30 transition-colors flex flex-col items-center justify-center gap-1 text-amber-500"
        />

        {/* Time Slots */}
        {(schedule.settings?.timeRanges || DEFAULT_TIME_RANGES).map((timeRange) => (
          <React.Fragment key={timeRange.label}>
            {schedule.slots
              .filter((slot) => slot.period === timeRange.label)
              .map((slot) => (
                <Dialog key={slot.id}>
                  <DialogTrigger asChild>
                    <Button
                      variant="ghost"
                      className={`w-full h-20 rounded-xl ${CATEGORIES[slot.category].bgClass} ${CATEGORIES[slot.category].hoverClass} transition-colors flex items-center justify-center group relative ${
                        isCurrentSlot(slot) ? "ring-2 ring-primary ring-offset-0 dark:ring-offset-background" : ""
                      }`}
                    >
                      <div className={`flex flex-col items-center justify-center w-full px-1 ${CATEGORIES[slot.category].color}`}>
                        <SlotContent slot={slot} timeRange={timeRange} />
                      </div>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>
                        {slot.day} {timeRange.label} ({timeRange.start}-{timeRange.end}) 슬롯 설정
                      </DialogTitle>
                    </DialogHeader>
                    <Tabs defaultValue="basic" className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="basic">기본 정보</TabsTrigger>
                        <TabsTrigger value="checklist">체크리스트</TabsTrigger>
                      </TabsList>
                      <TabsContent value="basic" className="space-y-4 pt-4">
                        <div className="space-y-4">
                          <Input
                            placeholder="제목"
                            value={slot.title || ""}
                            onChange={(e) => updateSlot(slot.id, { title: e.target.value })}
                          />
                          <Select
                            value={slot.category}
                            onValueChange={(value) => updateSlot(slot.id, { category: value as SlotCategory })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="카테고리 선택" />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(CATEGORIES).map(([value, { name, color }]) => (
                                <SelectItem key={value} value={value} className={color}>
                                  {name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Textarea
                            placeholder="메모"
                            value={slot.note || ""}
                            onChange={(e) => updateSlot(slot.id, { note: e.target.value })}
                          />
                        </div>
                      </TabsContent>
                      <TabsContent value="checklist" className="pt-4">
                        <Checklist
                          items={slot.checklist}
                          onChange={(checklist) => updateSlot(slot.id, { checklist })}
                        />
                      </TabsContent>
                    </Tabs>
                  </DialogContent>
                </Dialog>
              ))}
          </React.Fragment>
        ))}

        {/* Evening Routines */}
        <RoutineManager
          title="마무리 루틴"
          routines={schedule.eveningRoutines}
          onRoutineAdd={addRoutine("evening")}
          onRoutineRemove={removeRoutine("evening")}
          onRoutineUpdate={updateRoutineStatus("evening")}
          buttonClassName="col-span-7 h-16 rounded-xl bg-indigo-500/10 dark:bg-indigo-500/20 hover:bg-indigo-500/20 dark:hover:bg-indigo-500/30 transition-colors flex flex-col items-center justify-center gap-1 text-indigo-500"
        />
      </div>
      <div className="text-sm text-muted-foreground text-center">
        마지막 수정: {new Date(schedule.lastUpdated).toLocaleString()}
      </div>
      <SlotUsageChart slots={schedule.slots} />
    </div>
  )
}

