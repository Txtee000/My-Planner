"use client"

import { useState } from "react";
import { Status_Task_Box } from "./components/status_task_box";

type TaskForStatusTask = {
    label: string;
    type: TaskStatus;
}
const tasks:TaskForStatusTask[] = [
    {label: "Not Started", type: "not_started"},
    {label: "In Progress", type: "in_progress"},
    {label: "Done", type: "done"}
]

export function Status_Task(){
    const [refreshKey, setRefreshKey] = useState(0);

    function refreshStatusTasks(){
        setRefreshKey((current) => current + 1);
    }

    return(
        <div className="mt-8">
            <div className="text-(--font) font-bold text-[32px]">Status Task</div>
            <div className="bg-(--font) h-[1px] w-[100%] rounded-4xl" />

            <div className="mt-8 flex">
                {tasks.map((task) => {
                    return(
                        <Status_Task_Box
                            key={task.type}
                            label={task.label}
                            type={task.type}
                            refreshKey={refreshKey}
                            onTasksChanged={refreshStatusTasks}
                        />
                    );
                })}
            </div>
            


        </div>
    );
}
