import { EditTask } from "@/feature/components/create_task/edit_task";
import { useSingleTaskQuery } from "@/hooks/task_items/useTasksQuery";
import { useEffect, useState } from "react";

type TaskBoxProps = {
    id: string;
    taskname: string;
    taskStatus: TaskStatus;
    date: string;   
    time: string | null;
};

const statusColor = {
  normal: "bg-[#DCDCDC]",
  warning: "bg-[#E0904C]",
  due: "bg-[#CC2748]",
};



export function TaskBox({id, taskStatus, taskname, date, time }: TaskBoxProps) {

    const taskTime = new Date(date);
    const day = String(taskTime.getDate()).padStart(2, "0");
    const month = String(taskTime.getMonth() + 1).padStart(2, "0");
    const year = taskTime.getFullYear();
    const dateString =  taskTime.toLocaleDateString("en-US", {weekday: "short", })

    const [isOpen, setIsOpen] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    const { data: taskData } = useSingleTaskQuery({ taskId: id });
    const task = Array.isArray(taskData) ? taskData[0] : undefined;


    function getStatus() {
        
        const currentTime = new Date();
        const timeDiff = taskTime.getTime() - currentTime.getTime();
        const hoursDiff = timeDiff / (1000 * 60 * 60);
    
        if (hoursDiff <= 48) {
          return "due";
        } else if (hoursDiff <= 168) { 
          return "warning";
        } else {
          return "normal";
        }
      }


      
    
      async function openEditTask(){
        setIsOpen(!isOpen);
        
      }
      

      function refreshStatusTasks(){
          setRefreshKey((current) => current + 1);
      }

    
    
    
    return(
          <div>
            <button onClick={openEditTask} className={` relative w-[300px] h-[64px] rounded-2xl ${statusColor[getStatus()]} hover:shadow-[0_6px_8px_rgba(0,0,0,0.55)]`}>
              <div className="absolute top-0 right-0  w-[98%] h-full bg-(--color2) rounded-2xl pl-4 flex flex-col justify-center">
                  <div className="grid grid-cols-[80%_20%]">
                    <div className="flex flex-col items-start">
                      <div className="text-(--font)">{taskname}</div>
                      <div className="text-[#6b6b6b]">{day}/{month}/{year} ({dateString}) {time ? time : ""}</div>
                    </div>
                    {taskStatus === "done" &&(
                      <div className="flex justify-center items-center">
                        <span className="material-symbols-outlined !text-[32px] text-green-700 leading-none">
                          check_circle
                        </span>
                      </div>
                    )}
                  </div>
              </div>
            </button>

            {isOpen && (
              <div className="z-30">
                  <EditTask
                    task={task!}
                    onClose={() => setIsOpen(false)}
                    onUpdated={refreshStatusTasks}
                  />
              </div>
            )}
          </div>
          

    );
}


