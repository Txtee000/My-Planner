"use client"
import { useEffect, useState } from "react";
import { TaskBox } from "./task_box";
import { useTaskMutations } from "@/hooks/task_items/useTaskMutations";
import { useTasksQuery } from "@/hooks/task_items/useTasksQuery";


export default function Task() {
    const [isOpen, setIsOpen] = useState(false);

    const { data: tasksData, isLoading } = useTasksQuery({
        overdue: true,
        taskType: "task",
    });
    const tasks = Array.isArray(tasksData) ? tasksData : [];

    
    return(
        <div className=" fixed z-50 top-8 right-[3%] " >
            <div>
                <button onClick={() => setIsOpen(!isOpen)} className={`text-white w-12 h-12 bg-(--color2)  rounded-4xl flex justify-center items-center  duration-100
                ${!isOpen ? "shadow-[inset_1px_1px_4px_rgba(255,255,255,0.18),2px_4px_4px_rgba(0,0,0,0.55)]": ""}`}>
                    <div  className="material-symbols-outlined">
                        event_list 
                    </div>
                </button>
                

                {isOpen && (
                    <div className="absolute top-10 right-10 border border-gray-500 w-[360px] h-[440px] bg-(--color1) rounded-4xl p-4 text-(--font) ">
                        <div className="p-2 text-[24px]">
                            Task
                        </div>
                        <div className="overflow-scroll h-[88%]">
                            {tasks.map((task) => {
                                if(!task.deadline_date){
                                    return null;
                                }

                                const time = task.is_all_day ? null : task.deadline_time?.slice(0, 5) ?? null;
                                return(
                                     <div key={task.id} className="px-2 py-1">
                                        <TaskBox id={task.id} taskStatus={task.task_status} taskname={task.title} date={task.deadline_date} time={time} />
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>

        
    );
}
