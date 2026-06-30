
type TaskCategory = {
    id: string;
    task_type: TaskCategoryType;
    task_group: TaskGroup | null;
    title: string;
    color_hex: string;
}

type TaskCategoryType = "task" | "activity";


type TaskGroup = "study" | "work";
