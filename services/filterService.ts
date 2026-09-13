export type TaskFilterParams = {
    taskType?: string;
    taskGroup?: string;
};

export async function getFilterTask(params: TaskFilterParams = {}) {
    const searchParams = new URLSearchParams();
    if (params.taskType) {
        searchParams.set("task_type", params.taskType);
    }
    if (params.taskGroup) {
        searchParams.set("task_group", params.taskGroup);
    }
    const queryString = searchParams.toString();

    const response = await fetch(
        `/api/settings_page/filter_task${queryString ? `?${queryString}` : ""}`,
        {
            method: "GET",
        }
    );   
    
    if(!response.ok){
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch filter data");
    }

    const data = await response.json();

    // The API route returns: { data: [...] }
    const filters = data.data;
    if(!filters){
        return [];
    }

    return filters;
}


export async function addFilterTask({ name, task_type, task_group, statuses, dataScope, isAllDay, category_ids }: { name: string; task_type: string; task_group: string; statuses: string[]; dataScope: string; isAllDay: string; category_ids?: string[] }) {
    const response = await fetch(
        `/api/settings_page/filter_task`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ name, task_type, task_group, statuses, dataScope, isAllDay, category_ids }),
        }
    );
    if(!response.ok){
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to add filter data");
    }

    return await response.json();
}

export async function updateFilterTask({ id, name, task_type, task_group, statuses, dataScope, isAllDay, category_ids }: { id: string; name: string; task_type: string; task_group: string; statuses: string[]; dataScope: string; isAllDay: string; category_ids?: string[] }) {
    const response = await fetch(
        `/api/settings_page/filter_task`,
        {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ id, name, task_type, task_group, statuses, dataScope, isAllDay, category_ids }),
        }
    );
    if(!response.ok){
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update filter data");
    }

    return await response.json();
}

export async function deleteFilterTask(id: string) {
    const response = await fetch(
        `/api/settings_page/filter_task`,
        {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ id }),
        }
    );
    if(!response.ok){
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete filter data");
    }

    return await response.json();
}
