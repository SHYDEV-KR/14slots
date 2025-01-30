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

export interface DailyRoutine {
  id: string
  text: string
  dailyStatus: {
    [key: string]: {
      completed: boolean
      note?: string
    }
  }
}

export interface WeekSchedule {
  slots: TimeSlot[]
  morningRoutines: DailyRoutine[]
  eveningRoutines: DailyRoutine[]
  lastUpdated: string
}

