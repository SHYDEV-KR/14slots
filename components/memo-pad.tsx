"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { useLocalStorage } from "@/hooks/useLocalStorage"
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
import { CheckSquare, GripVertical, Plus, Square, X } from "lucide-react"
import { useState } from "react"

interface Todo {
  id: string
  text: string
  completed: boolean
  createdAt: string
}

interface SortableTodoItemProps {
  todo: Todo
  onToggle: (id: string) => void
  onRemove: (id: string) => void
}

function SortableTodoItem({ todo, onToggle, onRemove }: SortableTodoItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: todo.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group flex items-start gap-2 rounded-lg border p-3 bg-card"
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
      <Button
        variant="ghost"
        size="icon"
        className="h-5 w-5"
        onClick={() => onToggle(todo.id)}
      >
        {todo.completed ? (
          <CheckSquare className="w-4 h-4" />
        ) : (
          <Square className="w-4 h-4" />
        )}
      </Button>
      <div className="flex-1 space-y-1">
        <p className={`text-sm ${todo.completed ? "line-through text-muted-foreground" : ""}`}>
          {todo.text}
        </p>
        <p className="text-xs text-muted-foreground">
          {new Date(todo.createdAt).toLocaleString()}
        </p>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={() => onRemove(todo.id)}
      >
        <X className="w-4 h-4" />
      </Button>
    </div>
  )
}

export function MemoPad() {
  const [todos, setTodos] = useLocalStorage<Todo[]>("todos", [])
  const [memo, setMemo] = useLocalStorage<string>("memo", "")
  const [newTodo, setNewTodo] = useState("")

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleAddTodo = () => {
    if (!newTodo.trim()) return
    const todo: Todo = {
      id: crypto.randomUUID(),
      text: newTodo.trim(),
      completed: false,
      createdAt: new Date().toISOString(),
    }
    setTodos([todo, ...todos])
    setNewTodo("")
  }

  const handleToggleTodo = (id: string) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    )
  }

  const handleRemoveTodo = (id: string) => {
    setTodos(todos.filter((todo) => todo.id !== id))
  }

  const handleDragEndTodos = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      setTodos((items) => {
        const oldIndex = items.findIndex((item) => item.id === String(active.id))
        const newIndex = items.findIndex((item) => item.id === String(over.id))
        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }

  return (
    <div className="flex flex-col h-full">
      <Tabs defaultValue="todos" className="container max-w-4xl mx-auto h-full flex flex-col">
        <div className="flex-none px-4 pt-4">
          <TabsList className="grid w-full grid-cols-2 h-11">
            <TabsTrigger value="todos">할 일</TabsTrigger>
            <TabsTrigger value="memos">메모</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="todos" className="flex-1 overflow-hidden m-0 px-4">
          <div className="flex flex-col h-full">
            <div className="flex-none py-4">
              <div className="flex gap-2">
                <Input
                  placeholder="새로운 할 일 추가"
                  value={newTodo}
                  onChange={(e) => setNewTodo(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddTodo()}
                />
                <Button onClick={handleAddTodo}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="flex-1 overflow-auto">
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEndTodos}
              >
                <SortableContext items={todos} strategy={verticalListSortingStrategy}>
                  <div className="space-y-2 pb-24">
                    {todos.map((todo) => (
                      <SortableTodoItem
                        key={todo.id}
                        todo={todo}
                        onToggle={handleToggleTodo}
                        onRemove={handleRemoveTodo}
                      />
                    ))}
                    {todos.length === 0 && (
                      <div className="text-center text-muted-foreground text-sm py-8">
                        할 일이 없습니다.
                      </div>
                    )}
                  </div>
                </SortableContext>
              </DndContext>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="memos" className="flex-1 overflow-hidden m-0 px-4">
          <div className="h-full py-4">
            <Textarea
              placeholder="자유롭게 메모를 작성해보세요..."
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              className="h-full resize-none border-0 focus-visible:ring-0 p-0 text-base"
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
} 