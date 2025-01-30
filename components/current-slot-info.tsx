import { TimeSlot } from "@/types"
import { Clock, CheckCircle2, Circle } from "lucide-react"
import { Badge } from "./ui/badge";

const CATEGORIES: Record<string, { name: string; color: string }> = {
  personal: { name: "개인 충전/회복", color: "bg-blue-200" },
  family: { name: "가족/연인", color: "bg-pink-200" },
  team: { name: "팀원 관리", color: "bg-purple-200" },
  organization: { name: "조직 문화/시스템", color: "bg-yellow-200" },
  strategy: { name: "데이터/방향", color: "bg-green-200" },
  business: { name: "고객/사업개발", color: "bg-orange-200" },
  unassigned: { name: "미지정", color: "bg-gray-200" },
}

export interface CurrentSlotInfoProps {
  currentSlot: TimeSlot | undefined
}

export function CurrentSlotInfo({ currentSlot }: CurrentSlotInfoProps) {
  if (!currentSlot) {
    return null
  }

  const now = new Date()
  const hours = now.getHours().toString().padStart(2, "0")
  const minutes = now.getMinutes().toString().padStart(2, "0")

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {currentSlot.day}요일 {currentSlot.period === "morning" ? "오전" : "오후"}
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
            {currentSlot.checklist.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
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