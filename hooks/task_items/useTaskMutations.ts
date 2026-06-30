// src/hooks/useTaskMutations.ts
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { addTask, updateTask, deleteTask } from '@/services/taskService' // ปรับ path ให้ตรงกับไฟล์เดิมของคุณ

export function useTaskMutations() {
  const queryClient = useQueryClient()

  // 1. ฟังก์ชันเพิ่ม Task
  const addTaskMutation = useMutation({
    mutationFn: addTask,
    onSuccess: () => {
      // สั่งเคลียร์แคชทั้งหมดที่ขึ้นต้นด้วย 'tasks' เพื่ออัปเดตหน้าจอทุกส่วน
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    }
  })

  // 2. ฟังก์ชันแก้ไขข้อมูล Task (แก้อาการข้อมูลไม่อัปเดตข้ามไฟล์)
  const updateTaskMutation = useMutation({
    mutationFn: updateTask,
    onSuccess: () => {
      // 🌟 สั่งล้างแคช เพื่อให้ Component อื่นๆ ไปดึงข้อมูลใหม่ที่อัปเดตแล้วมาโชว์ทันที
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    }
  })

  // 3. ฟังก์ชันลบ Task
  const deleteTaskMutation = useMutation({
    mutationFn: deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    }
  })

  return {
    // ฟังก์ชันสำหรับนำไปผูกกับเหตุการณ์ (เช่น onClick หรือ onSubmit)
    addTask: addTaskMutation.mutate,
    updateTask: updateTaskMutation.mutate,
    deleteTask: deleteTaskMutation.mutate,

    // สถานะ Loading เอาไว้ทำ UI รอโหลด เช่น ปุ่มหมุนๆ หรือปิดปุ่มชั่วคราว
    isAdding: addTaskMutation.isPending,
    isUpdating: updateTaskMutation.isPending,
    isDeleting: deleteTaskMutation.isPending,

    // ตรวจจับกรณีเกิด Error
    error: updateTaskMutation.error || addTaskMutation.error || deleteTaskMutation.error
  }
}