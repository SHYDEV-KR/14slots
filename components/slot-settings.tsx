import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DualRangeSlider } from "@/components/ui/dual-range-slider"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { TimeRange } from "@/types"
import { AlertTriangle, Plus, Settings2, Trash2 } from "lucide-react"
import { useEffect, useState } from "react"

interface SlotSettingsProps {
  timeRanges: TimeRange[]
  onSave: (timeRanges: TimeRange[]) => void
}

// 시간을 24시간 형식의 문자열로 변환하는 함수
const formatTime = (hour: number, minute: number = 0): string => {
  return `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`
}

// 24시간 형식의 문자열을 분 단위로 변환하는 함수
const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(":").map(Number)
  return hours * 60 + minutes
}

// 분 단위를 24시간 형식의 문자열로 변환하는 함수
const minutesToTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return formatTime(hours, mins)
}

export function SlotSettings({ timeRanges, onSave }: SlotSettingsProps) {
  const [ranges, setRanges] = useState<TimeRange[]>(timeRanges)
  const [open, setOpen] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  useEffect(() => {
    setRanges(timeRanges)
  }, [timeRanges])

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen)
    if (!isOpen) {
      setRanges(timeRanges)
    }
  }

  const addRange = () => {
    const newIndex = ranges.length
    setRanges([
      ...ranges,
      {
        start: "09:00",
        end: "12:00",
        label: `시간대 ${newIndex + 1}`,
      },
    ])
  }

  const updateRange = (index: number, updates: Partial<TimeRange>) => {
    if (updates.label && updates.label.length > 4) {
      return // 4글자 이상 입력 방지
    }
    setRanges(
      ranges.map((range, i) =>
        i === index ? { ...range, ...updates } : range
      )
    )
  }

  const removeRange = (index: number) => {
    setRanges(ranges.filter((_, i) => i !== index))
  }

  const handleSave = () => {
    // 라벨 중복 체크
    const labels = new Set(ranges.map(range => range.label))
    if (labels.size !== ranges.length) {
      alert("시간대 이름이 중복되었습니다.")
      return
    }
    setShowConfirm(true)
  }

  const handleConfirm = () => {
    onSave(ranges)
    setOpen(false)
    setShowConfirm(false)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="icon">
            <Settings2 className="h-5 w-5" />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md h-[80vh] flex flex-col p-0">
          <div className="px-6 py-6">
            <DialogHeader>
              <DialogTitle>시간대 설정</DialogTitle>
              <DialogDescription className="pt-2 text-sm">
                시간대 이름은 2-4글자로 짧게 입력해주세요. (예: 오전, 오후1)
              </DialogDescription>
            </DialogHeader>
          </div>
          
          <ScrollArea className="flex-1 w-full px-6">
            <div className="space-y-6 pr-4">
              {ranges.map((range, index) => (
                <div key={index} className="space-y-4 pb-4 border-b last:border-b-0">
                  <div className="flex items-center gap-2">
                    <div className="w-24">
                      <Input
                        type="text"
                        placeholder="라벨"
                        value={range.label}
                        onChange={(e) =>
                          updateRange(index, { label: e.target.value })
                        }
                        className="w-full"
                        maxLength={4}
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeRange(index)}
                      className="ml-auto"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex-1">
                        <Input
                          type="time"
                          value={range.start}
                          onChange={(e) => updateRange(index, { start: e.target.value })}
                          className="w-full"
                        />
                      </div>
                      <span className="text-muted-foreground">~</span>
                      <div className="flex-1">
                        <Input
                          type="time"
                          value={range.end}
                          onChange={(e) => updateRange(index, { end: e.target.value })}
                          className="w-full"
                        />
                      </div>
                    </div>
                    <DualRangeSlider
                      value={[timeToMinutes(range.start), timeToMinutes(range.end)]}
                      min={0}
                      max={1440}
                      step={30}
                      minStepsBetweenThumbs={60}
                      label={(value) => minutesToTime(value)}
                      labelPosition="top"
                      className="my-4 pointer-events-none opacity-50"
                    />
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          <div className="flex justify-between p-6 mt-auto border-t">
            <Button variant="outline" onClick={addRange}>
              <Plus className="h-4 w-4 mr-2" />
              시간대 추가
            </Button>
            <Button onClick={handleSave}>저장</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>시간대 설정 변경 확인</DialogTitle>
            <DialogDescription className="flex items-start gap-2 pt-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500 shrink-0 mt-0.5" />
              <span>
                시간대 설정을 변경하면 모든 슬롯 정보가 초기화됩니다. 계속하시겠습니까?
              </span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setShowConfirm(false)}>
              취소
            </Button>
            <Button onClick={handleConfirm}>
              확인
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
} 