
type TaskCategoryType = "task" | "activity";
type TaskGroup = "study" | "work";

type GetTaskCategoriesParams = {
    taskType?: TaskCategoryType;
    taskGroup?: TaskGroup;
};


export async function getTaskCategories(params: GetTaskCategoriesParams = {}){
    const searchParams = new URLSearchParams();
    if(params.taskType){
        searchParams.set("task_type", params.taskType);
    }
    if (params.taskGroup) {
        searchParams.set("task_group", params.taskGroup);
    }
    const queryString = searchParams.toString();


    const response = await fetch(
        `/api/settings_page/setting_task${queryString ? `?${queryString}` : ""}`,
        {
            method: "GET",
        }
    );
    if(!response.ok){
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch task categories data");
    }

    const data = await response.json();
     
    const taskCatetories = data.taskCatetories;
    if(!taskCatetories){
        return null;
    }

    return taskCatetories;
}

export async function addTaskCategory(
    taskCategory_type: string,
    taskCategory_group: string,
    taskCategory_title: string,
    taskCategory_color_hex: string,
){
    const response = await fetch("/api/settings_page/setting_task",{
        method: "POST",
        body: JSON.stringify({
            task_group: taskCategory_group,
            task_type: taskCategory_type,
            title: taskCategory_title,
            color_hex: taskCategory_color_hex,
        })
    });
    if(!response.ok){
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update task category data");
    }

    return;

}


export async function updateTaskCategory(
    taskCategory_id: string,
    taskCategory_title: string,
    taskCategory_color_hex: string
){
    const response = await fetch("/api/settings_page/setting_task",{
        method: "PATCH",
        body: JSON.stringify({
            id: taskCategory_id,
            title: taskCategory_title,
            color_hex: taskCategory_color_hex,
        })
    });
    if(!response.ok){
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update task category data");
    }

    return;
}

export async function deleteTaskCategory(taskCategory_id: string,){
    const response = await fetch("/api/settings_page/setting_task",{
        method: "DELETE",
        body: JSON.stringify({
            id: taskCategory_id,
        })
    });
    if(!response.ok){
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete task category data");
    }
    return;

}