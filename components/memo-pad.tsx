"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
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
import { CheckSquare, GripVertical, Plus, Square, StickyNote, X } from "lucide-react"
import { useState } from "react"

interface Todo {
  id: string
  text: string
  completed: boolean
  createdAt: string
}

interface Memo {
  id: string
  text: string
  createdAt: string
}

interface SortableTodoItemProps {
  todo: Todo
  onToggle: (id: string) => void
  onRemove: (id: string) => void
}

interface SortableMemoItemProps {
  memo: Memo
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

function SortableMemoItem({ memo, onRemove }: SortableMemoItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: memo.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group flex items-start justify-between gap-4 rounded-lg border p-3 bg-card"
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
      <div className="flex-1 space-y-1">
        <p className="text-sm whitespace-pre-wrap">{memo.text}</p>
        <p className="text-xs text-muted-foreground">
          {new Date(memo.createdAt).toLocaleString()}
        </p>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={() => onRemove(memo.id)}
      >
        <X className="w-4 h-4" />
      </Button>
    </div>
  )
}

export function MemoPad() {
  const [todos, setTodos] = useLocalStorage<Todo[]>("todos", [])
  const [memos, setMemos] = useLocalStorage<Memo[]>("memos", [])
  const [newTodo, setNewTodo] = useState("")
  const [newMemo, setNewMemo] = useState("")

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

  const handleAddMemo = () => {
    if (!newMemo.trim()) return
    const memo: Memo = {
      id: crypto.randomUUID(),
      text: newMemo.trim(),
      createdAt: new Date().toISOString(),
    }
    setMemos([memo, ...memos])
    setNewMemo("")
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

  const handleRemoveMemo = (id: string) => {
    setMemos(memos.filter((memo) => memo.id !== id))
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

  const handleDragEndMemos = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      setMemos((items) => {
        const oldIndex = items.findIndex((item) => item.id === String(active.id))
        const newIndex = items.findIndex((item) => item.id === String(over.id))
        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <StickyNote className="w-5 h-5 text-muted-foreground" />
        <h2 className="text-lg font-medium">메모장</h2>
      </div>

      <Tabs defaultValue="todos" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="todos">할 일</TabsTrigger>
          <TabsTrigger value="memos">메모</TabsTrigger>
        </TabsList>

        <TabsContent value="todos" className="space-y-4">
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
          <ScrollArea className="h-[200px]">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEndTodos}
            >
              <SortableContext items={todos} strategy={verticalListSortingStrategy}>
                <div className="space-y-2">
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
          </ScrollArea>
        </TabsContent>

        <TabsContent value="memos" className="space-y-4">
          <div className="flex gap-2">
            <Textarea
              placeholder="새로운 메모 추가"
              value={newMemo}
              onChange={(e) => setNewMemo(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          <Button onClick={handleAddMemo} className="w-full">
            메모 추가
          </Button>
          <ScrollArea className="h-[200px]">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEndMemos}
            >
              <SortableContext items={memos} strategy={verticalListSortingStrategy}>
                <div className="space-y-4">
                  {memos.map((memo) => (
                    <SortableMemoItem
                      key={memo.id}
                      memo={memo}
                      onRemove={handleRemoveMemo}
                    />
                  ))}
                  {memos.length === 0 && (
                    <div className="text-center text-muted-foreground text-sm py-8">
                      메모가 없습니다.
                    </div>
                  )}
                </div>
              </SortableContext>
            </DndContext>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  )
} 