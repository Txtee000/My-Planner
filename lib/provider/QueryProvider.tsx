// src/providers/QueryProvider.tsx
"use client" // ต้องมีบรรทัดนี้เสมอ!

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'

export default function QueryProvider({ children }: { children: React.ReactNode }) {
  // สร้าง QueryClient ไว้ใน useState เพื่อป้องกันไม่ให้ข้อมูล Cache รั่วไหลข้าม Request บน Server
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60, // ตั้งค่า default ให้ดึงข้อมูลสดใหม่ใน 1 นาที
      },
    },
  }))

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}