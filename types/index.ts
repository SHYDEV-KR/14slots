export type SlotCategory = "personal" | "family" | "team" | "organization" | "strategy" | "business" | "unassigned"

export interface TimeRange {
  start: string // HH:mm 형식
  end: string // HH:mm 형식
  label: string // 예: "오전", "오후1", "오후2"
}

export interface SlotSettings {
  timeRanges: TimeRange[]
  lastUpdated: string
}

export interface ChecklistItem {
  id: string
  text: string
  completed: boolean
}

export interface TimeSlot {
  id: number
  day: string
  period: string // TimeRange의 label과 매칭
  category: SlotCategory
  title?: string
  note?: string
  checklist: ChecklistItem[]
  timeRange: TimeRange
}

export interface DailyRoutineStatus {
  completed: boolean
  completedAt?: string
}

export interface DailyRoutine {
  id: string
  text: string
  note?: string
  dailyStatus: {
    [key: string]: DailyRoutineStatus // key format: "YYYY-MM-DD"
  }
}

export interface WeekSchedule {
  slots: TimeSlot[]
  morningRoutines: DailyRoutine[]
  eveningRoutines: DailyRoutine[]
  lastUpdated: string
  settings: SlotSettings
}

