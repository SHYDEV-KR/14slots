"use client"

import { useState } from "react"
import { Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import type { ChecklistItem } from "../types"

interface ChecklistProps {
  items: ChecklistItem[]
  onChange: (items: ChecklistItem[]) => void
}

export function Checklist({ items, onChange }: ChecklistProps) {
  const [newItemText, setNewItemText] = useState("")

  const addItem = () => {
    if (!newItemText.trim()) return

    onChange([
      ...items,
      {
        id: crypto.randomUUID(),
        text: newItemText.trim(),
        completed: false,
      },
    ])
    setNewItemText("")
  }

  const toggleItem = (id: string) => {
    onChange(items.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item)))
  }

  const removeItem = (id: string) => {
    onChange(items.filter((item) => item.id !== id))
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          placeholder="새로운 항목 추가"
          value={newItemText}
          onChange={(e) => setNewItemText(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && addItem()}
        />
        <Button onClick={addItem} size="icon">
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-2">
            <Checkbox checked={item.completed} onCheckedChange={() => toggleItem(item.id)} />
            <span className={item.completed ? "line-through text-muted-foreground" : ""}>{item.text}</span>
            <Button variant="ghost" size="icon" className="ml-auto" onClick={() => removeItem(item.id)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}

