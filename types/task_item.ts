


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

type TaskCategory = {
    id: string;
    task_type: TaskCategoryType;
    task_group: TaskGroup | null;
    title: string;
    color_hex: string;
};

type TaskStatus = "not_started" | "in_progress" | "done";

type TaskCategoryType = "task" | "activity";
type TaskGroup = "study" | "work";

type TaskDeadlineValue = {
    date: Date;
    isAllDay: boolean;
    time: string;
};
