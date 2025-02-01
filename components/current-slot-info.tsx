import { TimeRange, TimeSlot } from "@/types";
import { CheckCircle2, Circle, Clock, MoveRight } from "lucide-react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { useState } from "react";

const DAYS = ["월", "화", "수", "목", "금", "토", "일"]

const CATEGORIES: Record<string, { name: string; color: string }> = {
  personal: { name: "개인 충전/회복", color: "bg-blue-200" },
  family: { name: "가족/연인", color: "bg-pink-200" },
  team: { name: "팀원 관리", color: "bg-purple-200" },
  organization: { name: "조직 문화/시스템", color: "bg-yellow-200" },
  strategy: { name: "전략/방향", color: "bg-green-200" },
  business: { name: "고객/사업개발", color: "bg-orange-200" },
  unassigned: { name: "미지정", color: "bg-gray-200" },
}

export interface CurrentSlotInfoProps {
  currentSlot: TimeSlot | undefined
  timeRanges: TimeRange[]
  slots?: TimeSlot[]
  onUpdateSlot?: (slotId: number, updates: Partial<TimeSlot>) => void
}

export function CurrentSlotInfo({ currentSlot, timeRanges, slots = [], onUpdateSlot }: CurrentSlotInfoProps) {
  const [todos, setTodos] = useLocalStorage<Array<{    // eslint-disable-line @typescript-eslint/no-unused-vars
    id: string;
    text: string;
    completed: boolean;
    createdAt: string;
  }>>("todos", [])
  const [selectedTask, setSelectedTask] = useState<{
    task: { id: string; text: string; slotInfo: string };
    slotId: number;
  } | null>(null)

  const handleMoveToTodos = (task: { id: string; text: string; slotInfo: string }, slotId: number) => {
    setSelectedTask({ task, slotId })
  }

  const handleConfirmMove = () => {
    if (!selectedTask) return

    // 메모패드에 추가
    const newTodo = {
      id: crypto.randomUUID(),
      text: `[${selectedTask.task.slotInfo}] ${selectedTask.task.text}`,
      completed: false,
      createdAt: new Date().toISOString(),
    }
    setTodos(prev => [newTodo, ...prev])

    // 기존 슬롯에서 삭제
    if (onUpdateSlot) {
      const slot = slots.find(s => s.id === selectedTask.slotId)
      if (slot) {
        const updatedChecklist = slot.checklist.filter(item => item.id !== selectedTask.task.id)
        onUpdateSlot(selectedTask.slotId, { checklist: updatedChecklist })
      }
    }

    setSelectedTask(null)
  }

  const getCurrentTimeStatus = () => {
    const now = new Date()
    const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`
    
    // 시간대 정렬
    const sortedRanges = [...timeRanges].sort((a, b) => a.start.localeCompare(b.start))
    
    // 첫 번째 시간대 이전
    if (currentTime < sortedRanges[0].start) {
      return {
        type: "before_day",
        message: "하루를 시작하기 전입니다. 오늘도 좋은 하루 되세요! 🌅"
      }
    }
    
    // 마지막 시간대 이후
    if (currentTime > sortedRanges[sortedRanges.length - 1].end) {
      return {
        type: "after_day",
        message: "오늘 하루도 고생 많으셨습니다. 푹 쉬세요! 🌙"
      }
    }
    
    // 시간대 사이
    for (let i = 0; i < sortedRanges.length - 1; i++) {
      if (currentTime > sortedRanges[i].end && currentTime < sortedRanges[i + 1].start) {
        return {
          type: "between_slots",
          message: "슬롯 사이 휴식 시간입니다. 잠시 숨 좀 돌리세요! ☕"
        }
      }
    }
    
    return null
  }

  const getUnfinishedTasks = (slots: TimeSlot[], day: string) => {
    return slots
      .filter(slot => slot.day === day)
      .flatMap(slot => 
        slot.checklist
          .filter(item => !item.completed)
          .map(item => ({
            ...item,
            slotInfo: `${slot.timeRange.label} - ${slot.title || CATEGORIES[slot.category].name}`
          }))
      )
  }

  const timeStatus = getCurrentTimeStatus()

  if (!currentSlot) {
    if (timeStatus?.type === "after_day") {
      const today = DAYS[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1]
      const unfinishedTasks = getUnfinishedTasks(slots || [], today)

      return (
        <>
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-muted-foreground">
              <Clock className="h-5 w-5" />
              <span>{timeStatus.message}</span>
            </div>
            
            {unfinishedTasks.length > 0 && (
              <div className="mt-6 space-y-4">
                <h3 className="text-sm font-medium text-muted-foreground">오늘의 미완료된 할 일 ({unfinishedTasks.length}개)</h3>
                <div className="space-y-3">
                  {unfinishedTasks.map((task) => {
                    const slot = slots.find(s => 
                      s.day === today && 
                      s.checklist.some(item => item.id === task.id)
                    )
                    if (!slot) return null

                    return (
                      <div key={task.id} className="flex items-start gap-2 p-3 rounded-lg bg-card border group">
                        <Circle className="w-4 h-4 mt-0.5 text-muted-foreground" />
                        <div className="flex-1 space-y-1">
                          <div className="text-sm">{task.text}</div>
                          <div className="text-xs text-muted-foreground">{task.slotInfo}</div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 opacity-100 transition-opacity"
                          onClick={() => handleMoveToTodos(task, slot.id)}
                        >
                          <MoveRight className="h-4 w-4" />
                        </Button>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          <Dialog open={!!selectedTask} onOpenChange={(open) => !open && setSelectedTask(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>할 일 이동</DialogTitle>
                <DialogDescription>
                  이 할 일을 메모패드로 이동하시겠습니까? 기존 슬롯에서는 삭제됩니다.
                </DialogDescription>
              </DialogHeader>
              {selectedTask && (
                <div className="space-y-1 py-4">
                  <div className="text-sm font-medium">{selectedTask.task.text}</div>
                  <div className="text-xs text-muted-foreground">{selectedTask.task.slotInfo}</div>
                </div>
              )}
              <DialogFooter className="flex gap-2">
                <Button variant="outline" onClick={() => setSelectedTask(null)}>
                  취소
                </Button>
                <Button onClick={handleConfirmMove}>
                  이동
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )
    }
    
    if (timeStatus) {
      return (
        <div className="flex items-center gap-3 text-muted-foreground">
          <Clock className="h-5 w-5" />
          <span>{timeStatus.message}</span>
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {currentSlot.day}요일 {currentSlot.timeRange.label}
              </span>
              {currentSlot.title && (
                <span className="text-sm font-medium">
                  {currentSlot.title}
                </span>
              )}
            </div>
            <Badge variant="secondary" className="text-xs">
              {CATEGORIES[currentSlot.category].name}
            </Badge>
          </div>
        </div>
      </div>

      {currentSlot.checklist.length > 0 && (
        <div className="space-y-2">
          <div className="text-sm text-muted-foreground">
            할 일: {currentSlot.checklist.filter(item => item.completed).length} / {currentSlot.checklist.length}
          </div>
          <div className="grid gap-1.5">
            {currentSlot.checklist.map((item) => (
              <div key={item.id} className="flex items-center gap-2">
                {item.completed ? (
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                ) : (
                  <Circle className="w-4 h-4 text-muted-foreground" />
                )}
                <span className={`text-sm ${item.completed ? "line-through text-muted-foreground" : ""}`}>
                  {item.text}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
} 