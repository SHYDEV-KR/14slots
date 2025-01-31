import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import type { DailyRoutine } from "@/types"
import { Plus, X } from "lucide-react"
import React, { useState } from "react"

const DAYS = ["월", "화", "수", "목", "금", "토", "일"]

interface RoutineManagerProps {
  routines: DailyRoutine[]
  onRoutineAdd: (text: string) => void
  onRoutineRemove: (id: string) => void
  onRoutineUpdate: (routineId: string, date: string, updates: { completed?: boolean; completedAt?: string; note?: string }) => void
  title: string
  buttonClassName?: string
}

const getDateString = (date: Date) => {
  return date.toISOString().split('T')[0]
}

const getPastDates = (weeks: number) => {
  const dates: (Date | null)[][] = Array(7).fill(null).map(() => Array(weeks).fill(null))
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const currentDayOfWeek = today.getDay()
  const mondayBasedDay = currentDayOfWeek === 0 ? 6 : currentDayOfWeek - 1
  
  for (let week = 0; week < weeks; week++) {
    for (let day = 0; day < 7; day++) {
      const date = new Date(today)
      date.setDate(date.getDate() - (week * 7 + (mondayBasedDay - day)))
      
      // 오늘 이후의 날짜는 null로 설정
      if (date <= today) {
        dates[day][weeks - 1 - week] = date
      }
    }
  }
  
  return dates
}

export function RoutineManager({
  routines = [],
  onRoutineAdd,
  onRoutineRemove,
  onRoutineUpdate,
  title,
  buttonClassName,
}: RoutineManagerProps) {
  const [newRoutine, setNewRoutine] = useState("")
  const dates = getPastDates(16)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayStr = getDateString(today)

  const handleAddRoutine = () => {
    if (!newRoutine.trim()) return
    onRoutineAdd(newRoutine.trim())
    setNewRoutine("")
  }

  const handleCheckIn = (routineId: string) => {
    const routine = routines.find(r => r.id === routineId)
    if (!routine) return
    
    // 이미 완료 상태가 있더라도 버튼은 계속 누를 수 있지만,
    // 실제 상태 업데이트는 처음 한 번만 수행
    if (!routine.dailyStatus[todayStr]?.completed) {
      onRoutineUpdate(routineId, todayStr, {
        completed: true,
        completedAt: new Date().toISOString(),
      })
    }
  }

  const handleNoteUpdate = (routineId: string, note: string) => {
    const routine = routines.find(r => r.id === routineId)
    if (!routine) return
    
    // 기존의 완료 상태와 완료 시간을 유지
    const currentStatus = routine.dailyStatus[todayStr] || {}
    onRoutineUpdate(routineId, todayStr, {
      ...currentStatus,
      note
    })
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          className={buttonClassName}
        >
          <span className="text-sm font-medium">{title}</span>
          <span className="text-xs">
            {routines.length}개의 루틴
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{title} 관리</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col flex-1 overflow-hidden">
          <div className="flex gap-2 p-4 border-b">
            <Input
              placeholder="새로운 루틴 추가"
              value={newRoutine}
              onChange={(e) => setNewRoutine(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddRoutine()}
            />
            <Button onClick={handleAddRoutine}>
              <Plus className="w-4 h-4" />
              추가
            </Button>
          </div>
          <div className="overflow-y-auto flex-1 p-4">
            <div className="space-y-8">
              {routines.map(routine => (
                <div key={routine.id} className="pb-4 border-b last:border-b-0">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-medium">{routine.text}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onRoutineRemove(routine.id)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="space-y-4">
                    <Textarea
                      placeholder="이 루틴에 대한 메모를 남겨보세요"
                      value={routine.note || ""}
                      onChange={(e) => handleNoteUpdate(routine.id, e.target.value)}
                      className="min-h-[80px] resize-none"
                    />
                    <div className="grid grid-cols-[repeat(16,1fr)] gap-1">
                      {DAYS.map((day, dayIndex) => (
                        <React.Fragment key={day}>
                          {dates[dayIndex].map((date, weekIndex) => {
                            if (!date) {
                              return (
                                <div
                                  key={`${dayIndex}-${weekIndex}`}
                                  className="aspect-square rounded-sm bg-transparent"
                                />
                              )
                            }
                            const dateStr = getDateString(date)
                            const isCompleted = routine.dailyStatus[dateStr]?.completed
                            return (
                              <div
                                key={dateStr}
                                className={`
                                  aspect-square rounded-sm
                                  ${isCompleted ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-800'}
                                `}
                              />
                            )
                          })}
                        </React.Fragment>
                      ))}
                    </div>
                    <Button
                      onClick={() => handleCheckIn(routine.id)}
                      className="w-full bg-green-100 hover:bg-green-200 text-green-900"
                    >
                      완료하기
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 