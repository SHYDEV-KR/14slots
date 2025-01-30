import type { TimeSlot } from "@/types"

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
    return (
      <div className="bg-muted/50 p-4 rounded-lg mb-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">미지정 슬롯</h2>
        </div>
        <p className="text-muted-foreground">슬롯 정보가 없습니다.</p>
      </div>
    )
  }

  return (
    <div className={`p-4 rounded-lg mb-4 ${CATEGORIES[currentSlot.category].color}`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">{currentSlot.title || "제목 없음"}</h2>
        <span className="text-sm bg-white/20 px-2 py-1 rounded">
          {CATEGORIES[currentSlot.category].name}
        </span>
      </div>
      <div className="space-y-2">
        {currentSlot.note && (
          <p className="text-sm">{currentSlot.note}</p>
        )}
        {currentSlot.checklist?.length > 0 && (
          <div className="space-y-1">
            {currentSlot.checklist.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={item.completed}
                  className="w-4 h-4"
                  readOnly
                />
                <span className="text-sm">{item.text}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 