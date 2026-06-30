type GetTasksParams = {
    title?: string;
    taskType?: TaskCategoryType;
    taskGroup?: TaskGroup;
    categoryId?: string;
    dateFrom?: string;
    dateTo?: string;
    timeFrom?: string;
    timeTo?: string;
};

export async function getTimeline_items(params: GetTasksParams = {}) {

    const searchParams = new URLSearchParams();
    if(params.title){
        searchParams.set("query", params.title)
    }
    if(params.taskType){
        searchParams.set("task_type", params.taskType);
    }
    if(params.taskGroup){
        searchParams.set("task_group", params.taskGroup);
    }
    if(params.categoryId){
        searchParams.set("category_id", params.categoryId);
    }
    if(params.dateFrom){
        searchParams.set("date_from", params.dateFrom);
    }
    if(params.dateTo){
        searchParams.set("date_to", params.dateTo);
    }
    if(params.timeFrom){
        searchParams.set("time_from", params.timeFrom);
    }
    if(params.timeTo){
        searchParams.set("time_to", params.timeTo);
    }

    const queryString = searchParams.toString();

    const response = await fetch(`/api/timeline_items${queryString ? `?${queryString}` : ""}`,{
        method: "GET",
    })
    if(!response.ok){
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch timeline_item data");
    }

    const data = await response.json();

    const timeline_items = data.timelineItems;
    if(!timeline_items){
        return null;
    }

    return timeline_items;
    
}

export async function addTimeline_item({
    category_id,
    title,
    startTime,
    endTime,
    startDate,
    endDate,
    description,
}: AddTimelineData){
    const response = await fetch("/api/timeline_items",{
        method: "POST",
        body: JSON.stringify({
            category_id,
            title,
            startTime,
            endTime,
            startDate,
            endDate,
            description: description?.trim() || null,
        })
    })

    if(!response.ok){
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to add task data");
    }

    return;
}

export async function updateTimeline_item({
    id,
    category_id,
    title,
    startTime,
    endTime,
    startDate,
    endDate,
    description,
}: UpdateTimelineData){
    const response = await fetch("/api/timeline_items",{
        method: "PATCH",
        body: JSON.stringify({
            id,
            category_id,
            title,
            startTime,
            endTime,
            startDate,
            endDate,
            description: description?.trim() || null,
        })
    })

    if(!response.ok){
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update timeline item data");
    }

    return;
}

export async function deleteTimeline_item(id: string){
    const response = await fetch("/api/timeline_items", {
        method: "DELETE",
        body: JSON.stringify({
            id,
        })
    })

    if(!response.ok){
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to add task data");
    }

    return;
}

