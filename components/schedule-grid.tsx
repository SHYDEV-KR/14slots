"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useLocalStorage } from "../hooks/useLocalStorage"
import { Checklist } from "./checklist"
import type { TimeSlot, SlotCategory, WeekSchedule, DailyRoutine } from "../types"
import React from "react"
import { RoutineManager } from "./routine-manager"

const DAYS = ["월", "화", "수", "목", "금", "토", "일"]
const PERIODS = ["오전", "오후"]

const CATEGORIES: Record<SlotCategory, { name: string; color: string }> = {
  personal: { name: "개인 충전/회복", color: "bg-blue-200" },
  family: { name: "가족/연인", color: "bg-pink-200" },
  team: { name: "팀원 관리", color: "bg-purple-200" },
  organization: { name: "조직 문화/시스템", color: "bg-yellow-200" },
  strategy: { name: "데이터/방향", color: "bg-green-200" },
  business: { name: "고객/사업개발", color: "bg-orange-200" },
  unassigned: { name: "미지정", color: "bg-gray-200" },
}

interface ScheduleGridProps {
  schedule: WeekSchedule
  setSchedule: (schedule: WeekSchedule) => void
}

export function ScheduleGrid({
  schedule,
  setSchedule,
}: ScheduleGridProps) {
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null)
  const today = new Date().getDay()
  const koreanDayIndex = today === 0 ? 6 : today - 1

  const updateSlot = (slotId: number, updates: Partial<TimeSlot>) => {
    setSchedule({
      ...schedule,
      slots: schedule.slots.map((slot) => (slot.id === slotId ? { ...slot, ...updates } : slot)),
      lastUpdated: new Date().toISOString(),
    })
  }

  const addRoutine = (type: "morning" | "evening") => (text: string) => {
    const routine: DailyRoutine = {
      id: crypto.randomUUID(),
      text: text.trim(),
      dailyStatus: DAYS.reduce((acc, day) => ({
        ...acc,
        [day]: { completed: false }
      }), {})
    }
    setSchedule({
      ...schedule,
      [type === "morning" ? "morningRoutines" : "eveningRoutines"]: [
        ...schedule[type === "morning" ? "morningRoutines" : "eveningRoutines"],
        routine
      ],
      lastUpdated: new Date().toISOString(),
    })
  }

  const removeRoutine = (type: "morning" | "evening") => (id: string) => {
    setSchedule({
      ...schedule,
      [type === "morning" ? "morningRoutines" : "eveningRoutines"]: schedule[
        type === "morning" ? "morningRoutines" : "eveningRoutines"
      ].filter(routine => routine.id !== id),
      lastUpdated: new Date().toISOString(),
    })
  }

  const updateRoutineStatus = (type: "morning" | "evening") => (
    routineId: string,
    day: string,
    updates: { completed?: boolean; note?: string }
  ) => {
    setSchedule({
      ...schedule,
      [type === "morning" ? "morningRoutines" : "eveningRoutines"]: schedule[
        type === "morning" ? "morningRoutines" : "eveningRoutines"
      ].map(routine =>
        routine.id === routineId
          ? {
              ...routine,
              dailyStatus: {
                ...routine.dailyStatus,
                [day]: {
                  ...routine.dailyStatus[day],
                  ...updates,
                }
              }
            }
          : routine
      ),
      lastUpdated: new Date().toISOString(),
    })
  }

  return (
    <div className="max-w-lg mx-auto p-4">
      <div className="grid grid-cols-7 gap-2">
        {/* Days header */}
        {DAYS.map((day, index) => (
          <div
            key={day}
            className={`text-center font-medium p-2 ${
              index === koreanDayIndex
                ? "bg-primary text-primary-foreground rounded-full"
                : ""
            }`}
          >
            {day}
          </div>
        ))}

        {/* Morning Routines */}
        <RoutineManager
          title="아침 루틴"
          routines={schedule.morningRoutines}
          onRoutineAdd={addRoutine("morning")}
          onRoutineRemove={removeRoutine("morning")}
          onRoutineUpdate={updateRoutineStatus("morning")}
          buttonClassName="col-span-7 h-24 rounded-xl bg-yellow-100 hover:bg-yellow-200 flex flex-col items-center justify-center gap-1"
        />

        {/* Time Slots */}
        {PERIODS.map((period) => (
          <React.Fragment key={period}>
            {schedule.slots
              .filter((slot) => slot.period === (period === "오전" ? "morning" : "afternoon"))
              .map((slot) => (
                <Dialog key={slot.id}>
                  <DialogTrigger asChild>
                    <Button
                      variant="ghost"
                      className={`w-full h-24 rounded-xl ${CATEGORIES[slot.category].color} hover:opacity-90 flex flex-col items-center justify-center gap-1`}
                      onClick={() => setSelectedSlot(slot)}
                    >
                      <span className="text-xs font-medium">{period}</span>
                      {slot.title && <span className="text-sm font-medium truncate w-full px-2">{slot.title}</span>}
                      {slot.checklist.length > 0 && (
                        <span className="text-xs">
                          {slot.checklist.filter((item) => item.completed).length}/{slot.checklist.length}
                        </span>
                      )}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>
                        {slot.day} {period} 슬롯 설정
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
                              {Object.entries(CATEGORIES).map(([value, { name }]) => (
                                <SelectItem key={value} value={value}>
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
          title="저녁 루틴"
          routines={schedule.eveningRoutines}
          onRoutineAdd={addRoutine("evening")}
          onRoutineRemove={removeRoutine("evening")}
          onRoutineUpdate={updateRoutineStatus("evening")}
          buttonClassName="col-span-7 h-24 rounded-xl bg-indigo-100 hover:bg-indigo-200 flex flex-col items-center justify-center gap-1"
        />
      </div>
      <div className="mt-4 text-sm text-gray-500 text-center">
        마지막 수정: {new Date(schedule.lastUpdated).toLocaleString()}
      </div>
    </div>
  )
}

