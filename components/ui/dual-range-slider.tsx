"use client"

import { cn } from "@/lib/utils"
import * as React from "react"
import { useCallback, useEffect, useRef, useState } from "react"

interface DualRangeSliderProps {
  min: number
  max: number
  step?: number
  value: [number, number]
  onChange: (value: [number, number]) => void
}

export function DualRangeSlider({
  min,
  max,
  step = 1,
  value,
  onChange,
}: DualRangeSliderProps) {
  const [isDragging, setIsDragging] = useState<"min" | "max" | null>(null)
  const sliderRef = useRef<HTMLDivElement>(null)
  const minThumbRef = useRef<HTMLDivElement>(null)
  const maxThumbRef = useRef<HTMLDivElement>(null)

  const getValueFromPosition = useCallback((position: number) => {
    if (!sliderRef.current) return min

    const sliderRect = sliderRef.current.getBoundingClientRect()
    const percentage = (position - sliderRect.left) / sliderRect.width
    let value = min + percentage * (max - min)

    // Step 값에 맞춰 조정
    value = Math.round(value / step) * step

    // min, max 범위 내로 조정
    return Math.min(Math.max(value, min), max)
  }, [min, max, step])

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return

    const newValue = getValueFromPosition(e.clientX)

    if (isDragging === "min") {
      onChange([Math.min(newValue, value[1] - step), value[1]])
    } else {
      onChange([value[0], Math.max(newValue, value[0] + step)])
    }
  }, [isDragging, getValueFromPosition, onChange, value, step])

  const handleMouseUp = useCallback(() => {
    setIsDragging(null)
  }, [])

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove)
      window.addEventListener("mouseup", handleMouseUp)
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isDragging, handleMouseMove, handleMouseUp])

  const leftPercentage = ((value[0] - min) / (max - min)) * 100
  const rightPercentage = ((value[1] - min) / (max - min)) * 100

  return (
    <div
      ref={sliderRef}
      className="relative h-4 w-full cursor-pointer"
      onClick={(e) => {
        const newValue = getValueFromPosition(e.clientX)
        const distToMin = Math.abs(newValue - value[0])
        const distToMax = Math.abs(newValue - value[1])
        if (distToMin < distToMax) {
          onChange([newValue, value[1]])
        } else {
          onChange([value[0], newValue])
        }
      }}
    >
      <div className="absolute top-1/2 h-1 w-full -translate-y-1/2 bg-secondary">
        <div
          className="absolute h-full bg-primary"
          style={{
            left: `${leftPercentage}%`,
            right: `${100 - rightPercentage}%`,
          }}
        />
      </div>

      <div
        ref={minThumbRef}
        className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 cursor-grab rounded-full border bg-background shadow-sm"
        style={{ left: `${leftPercentage}%` }}
        onMouseDown={() => setIsDragging("min")}
      />
      <div
        ref={maxThumbRef}
        className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 cursor-grab rounded-full border bg-background shadow-sm"
        style={{ left: `${rightPercentage}%` }}
        onMouseDown={() => setIsDragging("max")}
      />
    </div>
  )
}

DualRangeSlider.displayName = "DualRangeSlider" 