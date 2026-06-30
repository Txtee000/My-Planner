// src/hooks/useTasksQuery.ts
import { useQuery } from '@tanstack/react-query'
import { getTasks, getTask, getTaskWithMaxPositionByStatus } from '@/services/taskService' // ปรับ path ให้ตรงกับไฟล์เดิมของคุณ

/**
 * Hook สำหรับดึงรายการ Tasks ทั้งหมด (รองรับการทำ Filter)
 * @param params เงื่อนไขในการกรองข้อมูล เช่น { taskStatus: "TODO", categoryId: "123" }
 */
export function useTasksQuery(params: TaskFilterParams = {}) {
  return useQuery({
    // 🌟 สำคัญมาก: ใส่ params ลงใน queryKey เพื่อให้ TanStack แยกกลุ่ม Cache อัตโนมัติเมื่อเงื่อนไขเปลี่ยน
    queryKey: ['tasks', 'list', params],
    queryFn: () => getTasks(params),
    staleTime: 1000 * 60, // ข้อมูลจะถือว่าสดใหม่เป็นเวลา 1 นาที ลดการยิง API ซ้ำข้ามไฟล์
  })
}

/**
 * Hook สำหรับดึงข้อมูล Task เดี่ยวๆ ตัวเดียว
 * @param params รับ { taskId: "..." }
 */
export function useSingleTaskQuery(params: TaskFilterParams = {}) {
  return useQuery({
    queryKey: ['tasks', 'single', params.taskId],
    queryFn: () => getTask(params),
    enabled: !!params.taskId, // จะยิง API ก็ต่อเมื่อมีการส่ง taskId มาเท่านั้น
  })
}

/**
 * Hook สำหรับค้นหา Task ที่มี Position สูงสุดตามสถานะ
 */
export function useMaxPositionTaskQuery(taskStatus: TaskStatus) {
  return useQuery({
    queryKey: ['tasks', 'max-position', taskStatus],
    queryFn: () => getTaskWithMaxPositionByStatus(taskStatus),
  })
}