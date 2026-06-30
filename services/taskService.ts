
export async function getTask(params: TaskFilterParams ={}){
    const searchParams = new URLSearchParams();

    if(params.taskId){
        searchParams.set("taskId", params.taskId)
    }

    const queryString = searchParams.toString();
    const response = await fetch(
        `/api/task_items${queryString ? `?${queryString}` : ""}`,
        {
            method: "GET",
        }
    );

    if(!response.ok){
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch task data");
    }

    const data = await response.json();

    const tasks = data.tasks;
    if(!tasks){
        return null;
    }

    return tasks;
}

export async function getTasks(params: TaskFilterParams = {}){
    const searchParams = new URLSearchParams();

    if(params.taskType){
        searchParams.set("task_type", params.taskType);
    }
    if(params.taskStatus){
        searchParams.set("task_status", params.taskStatus);
    }
    if(params.categoryId){
        searchParams.set("category_id", params.categoryId);
    }
    if(params.isAllDay !== undefined){
        searchParams.set("is_all_day", String(params.isAllDay));
    }
    if(params.excludeTaskStatus){
        searchParams.set("exclude_task_status", params.excludeTaskStatus);
    }
    if (params.overdue !== undefined) {
        searchParams.set("overdue", String(params.overdue));
    }
    if(params.position !== undefined){
        searchParams.set("position", String(params.position));
    }
    if(params.created_at !== undefined){
        searchParams.set("created_at", String(params.created_at));
    }
    if(params.deadline_date !== undefined){
        const date = new Date(params.deadline_date);
        const deadlineDate = formatDateOnly(date);
        searchParams.set("deadline_date", String(deadlineDate));
    }
    

    const queryString = searchParams.toString();

    const response = await fetch(
        `/api/task_items${queryString ? `?${queryString}` : ""}`,
        {
            method: "GET",
        }
    );

    if(!response.ok){
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch task data");
    }

    const data = await response.json();

    const tasks = data.tasks;
    if(!tasks){
        return null;
    }

    return tasks;
}

export async function getTaskWithMaxPositionByStatus(taskStatus: TaskStatus){
    const tasks = await getTasks({
        taskStatus,
    }) as Task[] | null;

    if(!tasks || tasks.length === 0){
        return null;
    }

    return tasks.reduce((maxPositionTask, task) => {
        return task.position > maxPositionTask.position ? task : maxPositionTask;
    });
}

export async function addTask({
    category_id,
    title,
    position,
    date,
    task_status,
    description,
}: AddTaskData){
    
    const deadline = buildDeadlineParts(date);
    const is_all_day = date.isAllDay;

    const response = await fetch("/api/task_items",{
        method: "POST",
        body: JSON.stringify({
            category_id: category_id,
            title,
            position,
            deadline_date: deadline.date,
            deadline_time: deadline.time,
            task_status,
            description: description?.trim() || null,
            is_all_day,
        })
    });

    if(!response.ok){
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to add task data");
    }

    return;
}

export async function updateTask({
    id,
    category_id,
    title,
    position,
    date,
    task_status,
    description,
}: UpdateTaskData){

    const deadline = buildDeadlineParts(date);
    const is_all_day = date.isAllDay;
    
    const response = await fetch("/api/task_items",{
        method: "PATCH",
        body: JSON.stringify({
            id,
            category_id,
            title,
            position,
            deadline_date: deadline.date,
            deadline_time: deadline.time,
            task_status,
            description,
            is_all_day,
        })
    });

    if(!response.ok){
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update task data");
    }

    return;
}

export async function deleteTask(task_id: string){
    const response = await fetch("/api/task_items",{
        method: "DELETE",
        body: JSON.stringify({
            id: task_id,
        })
    });

    if(!response.ok){
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete task data");
    }

    return;
}





function formatDateOnly(date: Date){
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function buildDeadlineParts(taskDeadline: TaskDeadlineValue) {
    if (!taskDeadline) {
        return {
            date: null,
            time: null,
        };
    }
    return {
        date: formatDateOnly(taskDeadline.date),
        time: taskDeadline.isAllDay ? null : taskDeadline.time,
    };
}
