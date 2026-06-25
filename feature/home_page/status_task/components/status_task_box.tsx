

"use client"

import { CreateTask } from "@/feature/components/create_task/create_task";
import { EditTask } from "@/feature/components/create_task/edit_task";
import { getTasks, updateTask } from "@/services/taskService";
import { type DragEvent, useCallback, useEffect, useState } from "react";

const colorVariants = {
    not_started: {
        bg: "bg-[#494C50]",
        badge_bg: "bg-[#6b6b6b]",
        dot_bg: "bg-[#bebebe]",
        text: "text-[#bebebe]",
        border: "border-[#6b6b6b]",
        text_hover: "hover:text-gray-200",
        border_hover: "hover:border-gray-400",
        badge_bg_hover: "hover:bg-[#7A7878]"

    },
    in_progress: {
        bg: "bg-[#615B3B]",
        badge_bg: "bg-[#827840]",
        dot_bg: "bg-[#FCC951]",
        text: "text-[#FFDF94]",
        border: "border-[#827840]",
        text_hover: "hover:text-[#FCC951]",
        border_hover: "hover:border-[#CFAA4E]",
        badge_bg_hover: "hover:bg-[#A89B51]"
    },
    done: {
        bg: "bg-[#325432]",
        badge_bg: "bg-[#528552]",
        dot_bg: "bg-[#5EC45E]",
        text: "text-[#5EC45E]",
        border: "border-[#528552]",
        text_hover: "hover:text-[#3FD13F]",
        border_hover: "hover:border-[#3BA83B]",
        badge_bg_hover: "hover:bg-[#68A868]"
    },
};





function getDeadlineValue(task: Task){
    if(task.deadline_date){
        return {
            date: new Date(`${task.deadline_date}T00:00:00`),
            isAllDay: task.is_all_day,
            time: task.deadline_time?.slice(0, 5) ?? "00:00",
        };
    }

    return {
        date: new Date(),
        isAllDay: task.is_all_day,
        time: "00:00",
    };
}

type StatusTaskProps = {
    type: TaskStatus;
    label: string;
    refreshKey: number;
    onTasksChanged: () => void;
}
export function Status_Task_Box({type, label, refreshKey, onTasksChanged}: StatusTaskProps){
    const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [tasks, setTasks] = useState<Task[]>([])
    const [isDragOver, setIsDragOver] = useState(false);
    
    const color = colorVariants[type]

    const fetchTasks = useCallback(async () => {
        const data = await getTasks({
            taskStatus: type,
            position: true,
        });
        setTasks(Array.isArray(data) ? data : []);
    }, [type]);

    useEffect(() => {
        const timeoutId = window.setTimeout(() => {
            void fetchTasks();
        }, 0);

        return () => window.clearTimeout(timeoutId);
    }, [fetchTasks, refreshKey]);

    async function handleTasksChanged(){
        await fetchTasks();
        onTasksChanged();
    }

    function handleDragStart(event: DragEvent<HTMLButtonElement>, task: Task){
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData("application/json", JSON.stringify(task));
    }

    function handleDragOver(event: DragEvent<HTMLDivElement>){
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
        setIsDragOver(true);
    }

    function handleDragLeave(event: DragEvent<HTMLDivElement>){
        if(event.currentTarget.contains(event.relatedTarget as Node | null)){
            return;
        }

        setIsDragOver(false);
    }

    async function handleDrop(event: DragEvent<HTMLDivElement>){
        event.preventDefault();
        setIsDragOver(false);

        const draggedTask = JSON.parse(event.dataTransfer.getData("application/json")) as Task;
        if(draggedTask.task_status === type){
            return;
        }

        const lastPosition = tasks.reduce((maxPosition, task) => {
            return task.position > maxPosition ? task.position : maxPosition;
        }, 0);
        const nextPosition = lastPosition + 1000;

        try{
            await updateTask({
                id: draggedTask.id,
                category_id: draggedTask.category_id,
                title: draggedTask.title ?? "",
                position: nextPosition,
                date: getDeadlineValue(draggedTask),
                task_status: type,
                description: draggedTask.description,
            });

            onTasksChanged();
        }
        catch(error){
            console.error("Error move task: ", error);
        }
    }



    return(
        <>
            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`${color.bg} w-[244px] rounded-2xl p-4 mr-[24px] transition ${isDragOver ? "ring-2 ring-[var(--color4)]" : ""}`}
            >
                {/* header */}
                <div className="flex items-center">
                    <div className={`text-(--font) ${color.badge_bg} rounded-4xl flex justify-center items-center p-1 px-4 font-bold`}>
                        <div className={`w-4 h-4 ${color.dot_bg} rounded-4xl mr-2`} />
                        {label}
                    </div>
                    <div className={`${color.text} font-bold text-[20px] ml-2`}>{tasks.length}</div>
                </div>
                
                {/* content */}
                {tasks.map((task) => {
                    return(
                        <button
                            key={task.id}
                            type="button"
                            draggable
                            onDragStart={(event) => handleDragStart(event, task)}
                            onClick={() => setEditingTask(task)}
                            className={`${color.badge_bg} w-full text-left  break-words rounded-xl py-2 mt-4 p-2 text-(--font) ${color.badge_bg_hover}`}
                        >
                            {task.title}
                        </button>
                    );
                })}
                <div>
                    <button onClick={() => setIsCreateTaskOpen(true)} className={`mt-[16px] border border-[2px] text-left ${color.border} w-[100%] p-2 rounded-xl ${color.text} ${color.border_hover} ${color.text_hover}`}>
                        + New Page
                    </button>
                </div>
            </div>

            {isCreateTaskOpen && (
                <CreateTask
                    statusLabel={type}
                    onClose={() => setIsCreateTaskOpen(false)}
                    onCreated={handleTasksChanged}
                />
            )}

            {editingTask && (
                <EditTask
                    task={editingTask}
                    onClose={() => setEditingTask(null)}
                    onUpdated={handleTasksChanged}
                />
            )}
        </>
    );
}
