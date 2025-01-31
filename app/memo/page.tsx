"use client"

import { MemoPad } from "@/components/memo-pad"

export default function MemoPage() {
  return (
    <main className="container max-w-4xl mx-auto py-20 px-4">
      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <MemoPad />
      </div>
    </main>
  )
} 