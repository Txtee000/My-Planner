type Timeline_item = {
    id: string;
    user_id: string;
    category_id: string;
    
    title: string;

    start_date: string;
    end_date: string;
    start_time: string;
    end_time: string;

    created_at: string;
    updated_at: string;

    description: string | null;

    task_categories: TaskCategory;
}


type AddTimelineData = {
    category_id: string;
    title: string;
    startDate: string;
    endDate: string;
    startTime: string;
    endTime: string;
    description?: string | null;
};

type UpdateTimelineData = AddTimelineData & {
    id: string;
};
