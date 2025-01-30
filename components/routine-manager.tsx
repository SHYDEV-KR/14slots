import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Plus, X, Edit2 } from "lucide-react"
import type { DailyRoutine } from "@/types"
import { useState } from "react"

const DAYS = ["월", "화", "수", "목", "금", "토", "일"]

interface RoutineManagerProps {
  routines: DailyRoutine[]
  onRoutineAdd: (text: string) => void
  onRoutineRemove: (id: string) => void
  onRoutineUpdate: (routineId: string, day: string, updates: { completed?: boolean; note?: string }) => void
  title: string
  buttonClassName?: string
}

const truncateText = (text: string, maxLength: number) => {
  if (!text) return ""
  return text.length > maxLength ? text.slice(0, maxLength) + "..." : text
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

  const handleAddRoutine = () => {
    if (!newRoutine.trim()) return
    onRoutineAdd(newRoutine.trim())
    setNewRoutine("")
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
            <div className="space-y-4">
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
                  <div className="space-y-2">
                    {DAYS.map(day => (
                      <div key={day} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={routine.dailyStatus[day]?.completed || false}
                          onChange={(e) =>
                            onRoutineUpdate(routine.id, day, {
                              completed: e.target.checked,
                            })
                          }
                          className="w-4 h-4"
                        />
                        <span className="font-medium w-14">{day}요일</span>
                        <span className="flex-1 text-sm text-gray-600">
                          {truncateText(routine.dailyStatus[day]?.note || "", 30)}
                        </span>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-lg">
                            <DialogHeader>
                              <DialogTitle>{day}요일 메모 수정</DialogTitle>
                            </DialogHeader>
                            <Textarea
                              placeholder={`${day}요일 메모`}
                              value={routine.dailyStatus[day]?.note || ""}
                              onChange={(e) =>
                                onRoutineUpdate(routine.id, day, {
                                  note: e.target.value,
                                })
                              }
                              className="min-h-[120px] w-full"
                            />
                          </DialogContent>
                        </Dialog>
                      </div>
                    ))}
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