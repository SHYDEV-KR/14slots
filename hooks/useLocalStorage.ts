"use client"

import { useState } from "react"
import type { WeekSchedule, TimeSlot, TimeRange } from "@/types"

// 데이터 구조 검증 함수
function validateScheduleData(data: any): data is WeekSchedule {
  if (!data || typeof data !== 'object') return false
  
  // 필수 필드 존재 여부 확인
  if (!Array.isArray(data.slots)) return false
  if (!Array.isArray(data.morningRoutines)) return false
  if (!Array.isArray(data.eveningRoutines)) return false
  if (!data.settings || typeof data.settings !== 'object') return false
  if (!Array.isArray(data.settings.timeRanges)) return false
  
  // slots 배열의 각 항목 검증
  for (const slot of data.slots) {
    if (!validateTimeSlot(slot)) return false
  }
  
  // timeRanges 배열의 각 항목 검증
  for (const range of data.settings.timeRanges) {
    if (!validateTimeRange(range)) return false
  }
  
  return true
}

function validateTimeSlot(slot: any): slot is TimeSlot {
  return (
    slot &&
    typeof slot === 'object' &&
    typeof slot.id === 'number' &&
    typeof slot.day === 'string' &&
    typeof slot.period === 'string' &&
    typeof slot.title === 'string' &&
    typeof slot.note === 'string' &&
    typeof slot.category === 'string' &&
    Array.isArray(slot.checklist) &&
    validateTimeRange(slot.timeRange)
  )
}

function validateTimeRange(range: any): range is TimeRange {
  return (
    range &&
    typeof range === 'object' &&
    typeof range.label === 'string' &&
    typeof range.start === 'string' &&
    typeof range.end === 'string' &&
    /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(range.start) &&
    /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(range.end)
  )
}

export function useLocalStorage<T>(key: string, initialValue: T) {
  // State to store our value
  // Pass initial state function to useState so logic is only executed once
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") {
      return initialValue
    }
    try {
      const item = window.localStorage.getItem(key)
      if (!item) return initialValue

      try {
        const parsedItem = JSON.parse(item)
        
        // schedule 데이터인 경우 구조 검증
        if (key === 'schedule') {
          if (!validateScheduleData(parsedItem)) {
            console.error('Invalid schedule data structure')
            throw new Error('Invalid schedule data structure')
          }
        }
        // 다른 타입의 데이터는 기본 타입 검사
        else if (typeof parsedItem !== typeof initialValue) {
          throw new Error('Invalid data structure')
        }
        
        return parsedItem
      } catch (parseError) {
        console.error('Failed to parse stored value:', parseError)
        // 파싱 실패 시 초기값으로 리셋
        window.localStorage.setItem(key, JSON.stringify(initialValue))
        return initialValue
      }
    } catch (error) {
      console.error('Failed to access localStorage:', error)
      return initialValue
    }
  })

  // Return a wrapped version of useState's setter function that ...
  // ... persists the new value to localStorage.
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value
      
      // schedule 데이터인 경우 저장 전 구조 검증
      if (key === 'schedule' && !validateScheduleData(valueToStore)) {
        throw new Error('Invalid schedule data structure')
      }
      
      setStoredValue(valueToStore)
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
      }
    } catch (error) {
      console.error('Failed to store value:', error)
      throw error
    }
  }

  return [storedValue, setValue] as const
}

