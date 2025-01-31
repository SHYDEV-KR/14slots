"use client"

import { cn } from "@/lib/utils"
import * as React from "react"

interface DualRangeSliderProps {
  min: number
  max: number
  value: [number, number]
  step?: number
  minStepsBetweenThumbs?: number
  label?: (value: number) => React.ReactNode
  labelPosition?: "top" | "bottom"
  className?: string
  onChange?: (value: [number, number]) => void
}

export const DualRangeSlider = React.forwardRef<HTMLDivElement, DualRangeSliderProps>(
  ({ min, max, value, step = 1, minStepsBetweenThumbs = 1, label, labelPosition = "top", className, onChange }, ref) => {
    const [isDragging, setIsDragging] = React.useState<number | null>(null)
    const [values, setValues] = React.useState<[number, number]>(value)
    const sliderRef = React.useRef<HTMLDivElement>(null)

    React.useEffect(() => {
      setValues(value)
    }, [value])

    const getPercentage = (value: number) => {
      return ((value - min) / (max - min)) * 100
    }

    const getValueFromPosition = (position: number) => {
      const percentage = position
      const rawValue = (percentage * (max - min)) / 100 + min
      const steppedValue = Math.round(rawValue / step) * step
      return Math.min(Math.max(steppedValue, min), max)
    }

    const handleMouseDown = (index: number) => (e: React.MouseEvent) => {
      e.preventDefault()
      setIsDragging(index)
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging === null || !sliderRef.current) return

      const rect = sliderRef.current.getBoundingClientRect()
      const position = ((e.clientX - rect.left) / rect.width) * 100
      const newValue = getValueFromPosition(position)

      setValues(prev => {
        const newValues = [...prev] as [number, number]
        
        if (isDragging === 0) {
          if (newValue >= values[1] - step * minStepsBetweenThumbs) {
            newValues[0] = values[1] - step * minStepsBetweenThumbs
          } else {
            newValues[0] = newValue
          }
        } else {
          if (newValue <= values[0] + step * minStepsBetweenThumbs) {
            newValues[1] = values[0] + step * minStepsBetweenThumbs
          } else {
            newValues[1] = newValue
          }
        }

        onChange?.(newValues)
        return newValues
      })
    }

    const handleMouseUp = () => {
      setIsDragging(null)
    }

    React.useEffect(() => {
      if (isDragging !== null) {
        window.addEventListener('mousemove', handleMouseMove)
        window.addEventListener('mouseup', handleMouseUp)
      }

      return () => {
        window.removeEventListener('mousemove', handleMouseMove)
        window.removeEventListener('mouseup', handleMouseUp)
      }
    }, [isDragging, values, handleMouseMove])

    const renderLabels = () => {
      if (!label) return null

      return (
        <div className={cn(
          "flex justify-between w-full",
          labelPosition === "top" ? "mb-2" : "mt-2"
        )}>
          {values.map((v, i) => (
            <span key={i} className="text-sm text-muted-foreground">
              {label(v)}
            </span>
          ))}
        </div>
      )
    }

    return (
      <div className="w-full" ref={ref}>
        {labelPosition === "top" && renderLabels()}
        <div
          ref={sliderRef}
          className={cn(
            "relative h-1.5 w-full rounded-full bg-secondary",
            className
          )}
        >
          <div
            className="absolute h-full bg-primary rounded-full"
            style={{
              left: `${getPercentage(values[0])}%`,
              width: `${getPercentage(values[1]) - getPercentage(values[0])}%`
            }}
          />
          {values.map((value, index) => (
            <div
              key={index}
              className={cn(
                "absolute top-1/2 -translate-x-1/2 -translate-y-1/2",
                "h-4 w-4 cursor-pointer rounded-full border border-primary/50 bg-background shadow",
                "transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                "disabled:pointer-events-none disabled:opacity-50"
              )}
              style={{
                left: `${getPercentage(value)}%`
              }}
              onMouseDown={handleMouseDown(index)}
            />
          ))}
        </div>
        {labelPosition === "bottom" && renderLabels()}
      </div>
    )
  }
)

DualRangeSlider.displayName = "DualRangeSlider" 