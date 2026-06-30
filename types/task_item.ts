

type TaskFilterParams = {
    taskType?: TaskType;
    taskStatus?: TaskStatus;
    excludeTaskStatus?: TaskStatus;
    position?: boolean;
    created_at?: boolean;
    categoryId?: string;
    isAllDay?: boolean;
    overdue?: boolean;
    taskId?: string;
    deadline_date?: string;

}


type Task = {
    id: string;
    user_id: string;
    category_id: string | null;
    title: string;
    position: number;
    deadline_date: string;
    deadline_time: string | null;
    created_at: string;
    updated_at: string;
    task_status: TaskStatus;
    description: string | null;
    is_all_day: boolean;
}
type EditableTask = {
    id: string;
    category_id: string | null;
    title: string;
    position: number;
    deadline_date: string | null;
    deadline_time: string | null;
    task_status: TaskStatus | null;
    description: string | null;
    is_all_day: boolean;
};
type AddTaskData = {
    category_id?: string | null;
    title: string;
    position: number | null;
    date: TaskDeadlineValue;
    task_status: TaskStatus;
    description?: string | null;
};

type UpdateTaskData = {
    id: string;
    category_id?: string | null;
    title: string;
    position?: number;
    date: TaskDeadlineValue;
    task_status?: TaskStatus;
    description?: string | null;
};


type TaskStatus = "not_started" | "in_progress" | "done";
type TaskType = "task" | "timeline";



type TaskDeadlineValue = {
    date: Date;
    isAllDay: boolean;
    time: string;
};
