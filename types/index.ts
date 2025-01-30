export type SlotCategory = "personal" | "family" | "team" | "organization" | "strategy" | "business" | "unassigned"

export interface ChecklistItem {
  id: string
  text: string
  completed: boolean
}

export interface TimeSlot {
  id: number
  day: string
  period: "morning" | "afternoon"
  category: SlotCategory
  title?: string
  note?: string
  checklist: ChecklistItem[]
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
}

