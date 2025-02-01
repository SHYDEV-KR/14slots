"use client"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical, Plus, X } from "lucide-react"
import { useState } from "react"
import type { ChecklistItem } from "../types"

interface ChecklistProps {
  items: ChecklistItem[]
  onChange: (items: ChecklistItem[]) => void
}

interface SortableChecklistItemProps {
  item: ChecklistItem
  onToggle: (id: string) => void
  onRemove: (id: string) => void
}

function SortableChecklistItem({ item, onToggle, onRemove }: SortableChecklistItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: item.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group flex items-center gap-2 rounded-lg border p-2 bg-card"
    >
      <Button
        variant="ghost"
        size="icon"
        className="h-5 w-5 cursor-grab"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="w-4 h-4" />
      </Button>
      <Checkbox checked={item.completed} onCheckedChange={() => onToggle(item.id)} />
      <span className={item.completed ? "line-through text-muted-foreground" : ""}>
        {item.text}
      </span>
      <Button
        variant="ghost"
        size="icon"
        className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={() => onRemove(item.id)}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  )
}

export function Checklist({ items, onChange }: ChecklistProps) {
  const [newItemText, setNewItemText] = useState("")

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

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

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((item) => item.id === String(active.id))
      const newIndex = items.findIndex((item) => item.id === String(over.id))
      onChange(arrayMove(items, oldIndex, newIndex))
    }
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
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={items} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {items.map((item) => (
              <SortableChecklistItem
                key={item.id}
                item={item}
                onToggle={toggleItem}
                onRemove={removeItem}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  )
}

