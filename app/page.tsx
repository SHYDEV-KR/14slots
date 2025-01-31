"use client"

import type { WeekSchedule } from "@/types"
import { CurrentSlotInfo } from "../components/current-slot-info"
import { ScheduleGrid } from "../components/schedule-grid"
import { useLocalStorage } from "../hooks/useLocalStorage"

const DEFAULT_TIME_RANGES = [
  { label: "오전", start: "08:00", end: "12:00" },
  { label: "오후", start: "13:00", end: "17:00" },
]

export default function HomePage() {
  const [schedule, setSchedule] = useLocalStorage<WeekSchedule>("schedule", {
    slots: [],
    morningRoutines: [],
    eveningRoutines: [],
    lastUpdated: new Date().toISOString(),
    settings: {
      timeRanges: DEFAULT_TIME_RANGES,
      lastUpdated: new Date().toISOString(),
    },
  })

  const getCurrentSlot = () => {
    const now = new Date()
    const days = ["일", "월", "화", "수", "목", "금", "토"]
    const currentDay = days[now.getDay()]
    const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`
    
    return schedule.slots.find(slot => 
      slot.day === currentDay && 
      currentTime >= slot.timeRange.start && 
      currentTime <= slot.timeRange.end
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto py-20 px-4 space-y-8">
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <CurrentSlotInfo 
            currentSlot={getCurrentSlot()} 
            timeRanges={schedule.settings?.timeRanges || DEFAULT_TIME_RANGES}
          />
        </div>

        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <ScheduleGrid 
            schedule={schedule}
            setSchedule={setSchedule}
          />
        </div>
      </div>
    </main>
  )
}

