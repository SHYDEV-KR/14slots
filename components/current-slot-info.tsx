import { TimeRange, TimeSlot } from "@/types";
import { CheckCircle2, Circle, Clock } from "lucide-react";
import { Badge } from "./ui/badge";

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
}

export function CurrentSlotInfo({ currentSlot, timeRanges }: CurrentSlotInfoProps) {
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
          message: "슬롯 사이 휴식 시간입니다. 잠시 쉬어가세요! ☕"
        }
      }
    }
    
    return null
  }

  const timeStatus = getCurrentTimeStatus()

  if (!currentSlot) {
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