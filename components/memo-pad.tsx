"use client"

import { useState } from "react"
import { Textarea } from "@/components/ui/textarea"
import { useLocalStorage } from "../hooks/useLocalStorage"

export function MemoPad() {
  const [memo, setMemo] = useLocalStorage<string>("global-memo", "")

  return (
    <div className="w-full max-w-lg mx-auto mt-4 p-4">
      <Textarea
        placeholder="여기에 메모를 작성하세요..."
        value={memo}
        onChange={(e) => setMemo(e.target.value)}
        className="min-h-[200px] w-full"
      />
    </div>
  )
} 