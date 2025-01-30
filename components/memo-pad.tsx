"use client"

import { useLocalStorage } from "@/hooks/useLocalStorage"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { StickyNote, X, CheckSquare, Square, Plus } from "lucide-react"
import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"

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

export function MemoPad() {
  const [todos, setTodos] = useLocalStorage<Todo[]>("todos", [])
  const [memos, setMemos] = useLocalStorage<Memo[]>("memos", [])
  const [newTodo, setNewTodo] = useState("")
  const [newMemo, setNewMemo] = useState("")

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
            <div className="space-y-2">
              {todos.map((todo) => (
                <div
                  key={todo.id}
                  className="group flex items-start gap-2 rounded-lg border p-3 bg-card"
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5"
                    onClick={() => handleToggleTodo(todo.id)}
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
                    onClick={() => handleRemoveTodo(todo.id)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              {todos.length === 0 && (
                <div className="text-center text-muted-foreground text-sm py-8">
                  할 일이 없습니다.
                </div>
              )}
            </div>
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
            <div className="space-y-4">
              {memos.map((memo) => (
                <div
                  key={memo.id}
                  className="group flex items-start justify-between gap-4 rounded-lg border p-3 bg-card"
                >
                  <div className="space-y-1">
                    <p className="text-sm whitespace-pre-wrap">{memo.text}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(memo.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleRemoveMemo(memo.id)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              {memos.length === 0 && (
                <div className="text-center text-muted-foreground text-sm py-8">
                  메모가 없습니다.
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  )
} 