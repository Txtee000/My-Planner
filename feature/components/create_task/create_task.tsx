"use client"

import { CalendarForTask } from "@/feature/components/create_task/calendar_for_task";
import { getTaskCategories } from "@/services/taskCategoryService";
import { addTask, getTaskWithMaxPositionByStatus } from "@/services/taskService";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

type CreateTaskProps = {
    statusLabel: TaskStatus;    
    onClose: () => void;
    onCreated?: () => Promise<void> | void;
};
type SelectBoxType = "" | "taskType" | "taskGroup" | "taskCategory" | "taskStatus";

const statusColors: Record<TaskStatus, string> = {
    not_started: "bg-[#bebebe]",
    in_progress: "bg-[#FCC951]",
    done: "bg-[#5EC45E]",
};




function getReadableTextColor(colorHex: string){
    const hex = colorHex.replace("#", "");
    const red = parseInt(hex.slice(0, 2), 16);
    const green = parseInt(hex.slice(2, 4), 16);
    const blue = parseInt(hex.slice(4, 6), 16);
    const brightness = (red * 299 + green * 587 + blue * 114) / 1000;

    return brightness > 150 ? "var(--color1)" : "var(--font)";
}

export function CreateTask({statusLabel, onClose, onCreated}: CreateTaskProps){

    const router = useRouter();
    const [title, setTitle] = useState("Name");
    const [taskComment, setTaskComment] = useState("");
    const [taskDeadline, setTaskDeadline] = useState<TaskDeadlineValue>({
        date: new Date(),
        isAllDay: true,
        time: "00:00"
    });
    const [categories, setCategories] = useState<TaskCategory[]>([]);

    const [selectedTaskType, setSelectedTaskType] = useState<TaskCategoryType>("task");
    const [selectedTaskGroup, setSelectedTaskGroup] = useState<TaskGroup>("study");
    const [selectedTaskCategory, setSelectedTaskCategory] = useState(""); 
    const [selectedStatus, setSelectedStatus] = useState<TaskStatus>(statusLabel);

    const [openSelectTaskCategory, setOpenSelectTaskCategory] = useState<SelectBoxType>(""); // ระบุว่าต้องเปิดกล่องไหน
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState("");

    const groupedCategories = useMemo(() => ({
        study: categories.filter((category) => category.task_type === "task" && category.task_group === "study"),
        work: categories.filter((category) => category.task_type === "task" && category.task_group === "work"),
        activity: categories.filter((category) => category.task_type === "activity"),
    }), [categories]);

    const selectedCategoryList = selectedTaskType === "activity"
        ? groupedCategories.activity
        : groupedCategories[selectedTaskGroup];

    const selectedCategory = selectedCategoryList.find((category) => category.id === selectedTaskCategory);
    const isSubmitDisabled = !selectedTaskCategory || isSubmitting;

    const fetchTaskCategories = useCallback(async () => {
        try{
            const data = await getTaskCategories();
            setCategories(Array.isArray(data) ? data : []);
        }
        catch(error){
            console.error("Error fetching task categories: ", error);
            setCategories([]);
        }
    }, []);

    useEffect(() => {
        const timeoutId = window.setTimeout(() => {
            void fetchTaskCategories();
        }, 0);

        return () => window.clearTimeout(timeoutId);
    }, [fetchTaskCategories]);

    function handleSelectType(type: SelectBoxType){
        if(type === openSelectTaskCategory){
            setOpenSelectTaskCategory("");
            return;
        }

        setOpenSelectTaskCategory(type);
    }

    function handleSelectTaskType(type: TaskCategoryType){
        setSelectedTaskType(type);
        setSelectedTaskCategory("");
        if(type === "activity"){
            setSelectedTaskGroup("study");
        }
    }

    function handleSelectTaskGroup(group: TaskGroup){
        setSelectedTaskGroup(group);
        setSelectedTaskCategory("");
    }

    function handleSelectTaskCategory(categoryId: string){
        setSelectedTaskCategory(categoryId);
        setOpenSelectTaskCategory("");
    }

    function handleSelectStatus(status: TaskStatus){
        setSelectedStatus(status);
        setOpenSelectTaskCategory("");
    }

    async function submitForm(){
        if(isSubmitting || isSubmitDisabled){
            return;
        }

        setIsSubmitting(true);
        setSubmitError("");

        try{
            const task = await getTaskWithMaxPositionByStatus(selectedStatus);
            const nextPos = task ? task.position + 1000 : 1000;

            await addTask({
                category_id: selectedTaskCategory,
                title: title,
                position: nextPos,
                date: taskDeadline,
                task_status: selectedStatus,
                task_type: "task",
                description: taskComment,
            });

            await onCreated?.();
            onClose();
            router.replace("/home_page/day");
            router.refresh();
        }catch (error){
            console.error("Error add task: ", error);
            setSubmitError("Create task failed. Please try again.");
            setIsSubmitting(false);
        }
    }

    function renderSelectTaskCategoryBox(){
       return(
         <div className={`min-w-[160px] rounded-2xl border border-[var(--color3)]/20 bg-[var(--color2)] p-2 text-[var(--font)] shadow-[0_16px_36px_rgba(0,0,0,0.45)]`}>
            {openSelectTaskCategory == "taskType" && (
                <div className="space-y-2">
                    <button
                        type="button"
                        onClick={() => handleSelectTaskType("task")}
                        className={`
                            flex w-full items-center justify-between rounded-xl border p-3 text-left transition
                            ${selectedTaskType === "task"
                                ? "border-[var(--color4)] bg-[var(--color4)]/10 text-[var(--color4)]"
                                : "border-transparent bg-[var(--color1)] text-[var(--font)]/80 hover:border-[var(--color4)]/60 hover:text-[var(--font)]"
                            }
                        `}
                    >
                        <div>
                            <div className="text-[16px] font-bold">Task</div>
                        </div>
                        {selectedTaskType === "task" && (
                            <span className="material-symbols-outlined !text-[20px]">check</span>
                        )}
                    </button>

                    <button
                        type="button"
                        onClick={() => handleSelectTaskType("activity")}
                        className={`
                            flex w-full items-center justify-between rounded-xl border p-3 text-left transition
                            ${selectedTaskType === "activity"
                                ? "border-[var(--color4)] bg-[var(--color4)]/10 text-[var(--color4)]"
                                : "border-transparent bg-[var(--color1)] text-[var(--font)]/80 hover:border-[var(--color4)]/60 hover:text-[var(--font)]"
                            }
                        `}
                    >
                        <div>
                            <div className="text-[16px] font-bold">Activity</div>
                        </div>


                        {selectedTaskType === "activity" && (
                            <span className="material-symbols-outlined !text-[20px]">check</span>
                        )}
                    </button>
                </div>
            )}
            {openSelectTaskCategory == "taskGroup" && (
                <div className="space-y-2">
                    <button
                        type="button"
                        onClick={() => handleSelectTaskGroup("study")}
                        className={`
                            flex w-full items-center justify-between rounded-xl border p-3 text-left transition
                            ${selectedTaskGroup === "study"
                                ? "border-[var(--color4)] bg-[var(--color4)]/10 text-[var(--color4)]"
                                : "border-transparent bg-[var(--color1)] text-[var(--font)]/80 hover:border-[var(--color4)]/60 hover:text-[var(--font)]"
                            }
                        `}
                    >
                        <div>
                            <div className="text-[16px] font-bold">Study</div>
                        </div>
                        {selectedTaskGroup === "study" && (
                            <span className="material-symbols-outlined !text-[20px]">check</span>
                        )}
                    </button>

                    <button
                        type="button"
                        onClick={() => handleSelectTaskGroup("work")}
                        className={`
                            flex w-full items-center justify-between rounded-xl border p-3 text-left transition
                            ${selectedTaskGroup === "work"
                                ? "border-[var(--color4)] bg-[var(--color4)]/10 text-[var(--color4)]"
                                : "border-transparent bg-[var(--color1)] text-[var(--font)]/80 hover:border-[var(--color4)]/60 hover:text-[var(--font)]"
                            }
                        `}
                    >
                        <div>
                            <div className="text-[16px] font-bold">Work</div>
                        </div>


                        {selectedTaskGroup === "work" && (
                            <span className="material-symbols-outlined !text-[20px]">check</span>
                        )}
                    </button>
                </div>
            )}
            {openSelectTaskCategory == "taskCategory" &&(
                <div className="max-h-[240px] space-y-2 overflow-y-auto">
                    {selectedCategoryList.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-[var(--color3)]/25 p-3 text-center text-[14px] text-[var(--color3)]">
                            No categories
                        </div>
                    ) : (
                        selectedCategoryList.map((category) => (
                            <button
                                key={category.id}
                                type="button"
                                onClick={() => handleSelectTaskCategory(category.id)}
                                className={`
                                    flex w-full items-center justify-between gap-3 rounded-xl border p-3 text-left transition
                                    ${selectedTaskCategory === category.id
                                        ? "border-[var(--color4)] bg-[var(--color4)]/10 text-[var(--color4)]"
                                        : "border-transparent bg-[var(--color1)] text-[var(--font)]/80 hover:border-[var(--color4)]/60 hover:text-[var(--font)]"
                                    }
                                `}
                            >
                                <div className="flex min-w-0 items-center gap-2">
                                    <span
                                        className="h-3 w-3 shrink-0 rounded-full"
                                        style={{ backgroundColor: category.color_hex }}
                                    />
                                    <div className="truncate text-[15px] font-bold">{category.title}</div>
                                </div>
                                {selectedTaskCategory === category.id && (
                                    <span className="material-symbols-outlined !text-[20px]">check</span>
                                )}
                            </button>
                        ))
                    )}
                </div>
            )}
            {openSelectTaskCategory === "taskStatus" && (
                <div className="space-y-2">
                    <button
                        type="button"
                        onClick={() => handleSelectStatus("not_started")}
                        className={`
                            flex w-full items-center justify-between rounded-xl border p-3 text-left transition
                            ${selectedStatus === "not_started"
                                ? "border-[var(--color4)] bg-[var(--color4)]/10 text-[var(--color4)]"
                                : "border-transparent bg-[var(--color1)] text-[var(--font)]/80 hover:border-[var(--color4)]/60 hover:text-[var(--font)]"
                            }
                        `}
                    >
                        <div className="flex items-center gap-2 mr-4">
                            <span className="h-3 w-3 shrink-0 rounded-full bg-[#bebebe]" />
                            <div className="text-[16px] font-bold">Not Started</div>
                        </div>
                        {selectedStatus === "not_started" && <span className="material-symbols-outlined !text-[20px]">check</span>}
                    </button>
                    <button
                        type="button"
                        onClick={() => handleSelectStatus("in_progress")}
                        className={`
                            flex w-full items-center justify-between rounded-xl border p-3 text-left transition
                            ${selectedStatus === "in_progress"
                                ? "border-[var(--color4)] bg-[var(--color4)]/10 text-[var(--color4)]"
                                : "border-transparent bg-[var(--color1)] text-[var(--font)]/80 hover:border-[var(--color4)]/60 hover:text-[var(--font)]"
                            }
                        `}
                    >
                        <div className="flex items-center gap-2 mr-4">
                            <span className="h-3 w-3 shrink-0 rounded-full bg-[#FCC951]" />
                            <div className="text-[16px] font-bold">In Progress</div>
                        </div>
                        {selectedStatus === "in_progress" && <span className="material-symbols-outlined !text-[20px]">check</span>}
                    </button>
                    <button
                        type="button"
                        onClick={() => handleSelectStatus("done")}
                        className={`
                            flex w-full items-center justify-between rounded-xl border p-3 text-left transition
                            ${selectedStatus === "done"
                                ? "border-[var(--color4)] bg-[var(--color4)]/10 text-[var(--color4)]"
                                : "border-transparent bg-[var(--color1)] text-[var(--font)]/80 hover:border-[var(--color4)]/60 hover:text-[var(--font)]"
                            }
                        `}
                    >
                        <div className="flex items-center gap-2 mr-4">
                            <span className="h-3 w-3 shrink-0 rounded-full bg-[#5EC45E]" />
                            <div className="text-[16px] font-bold">Done</div>
                        </div>
                        {selectedStatus === "done" && <span className="material-symbols-outlined !text-[20px]">check</span>}
                    </button>
                </div>
            )}
            
        </div>
       );
    }

    return(
        <div
            className="fixed inset-0 z-[999] flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-task-title"
        >
            <div className="absolute inset-0 bg-black/70" />

            <div className="relative z-10 w-full max-w-[920px] rounded-2xl bg-[var(--color1)] p-4 text-[var(--font)] shadow-[0_0_20px_rgba(90,187,194,0.5)]">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h2 id="create-task-title" className="text-[32px] font-bold text-(--font)/70">
                            Create Task 
                        </h2>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="flex justify-center rounded-xl border border-[var(--color3)]/20 bg-[var(--color1)] px-4 py-2 text-[14px] font-bold text-[var(--font)] transition hover:border-[var(--color4)] hover:text-[var(--color4)] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <div className="mt-4 grid gap-20 lg:gap-4 lg:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_360px]">
                    <div className="rounded-xl border-t border-dashed border-[var(--color3)]/25 p-4 leading-6 text-[var(--color3)]">
                        <div>
                            <input 
                                value={title}
                                onChange={(event) => setTitle(event.target.value)}
                                className="h-[24px] text-[32px] h-full font-bold"
                            
                            />
                        </div>
                        {/* status bar */}
                        <div className="flex items-center mt-4">
                            <span className="material-symbols-outlined">
                                stat_0
                            </span>
                            <div className="ml-2 text-[16px] font-bold">Status:</div>
                            <button
                                type="button"
                                onClick={() => handleSelectType("taskStatus")}
                                className="ml-2 flex items-center gap-2 rounded-4xl bg-gray-500 px-4 py-[1px] font-bold text-(--font)"
                            >
                                <span className={`h-3 w-3 shrink-0 rounded-full ${statusColors[selectedStatus]}`} />
                                <span className="capitalize">{selectedStatus.replace("_", " ")}</span>
                            </button>
                        </div>

                        
                        {/* type task */}
                        <div className="flex items-center  mt-4">
                            <span className="material-symbols-outlined !text-[24px]">
                                format_list_bulleted 
                            </span>
                            <div className=" ml-2 text-[16px] font-bold">Type:</div>
                            <button 
                                onClick={() => handleSelectType("taskType")}
                                className="py-[1px] px-4 ml-2 bg-gray-500 text-(--font) rounded-4xl font-bold"
                            >
                                {selectedTaskType === "task" ? "Task" : "Activity"}
                            </button>

                            {selectedTaskType == "task" && (
                                <div>
                                    <button 
                                        onClick={() => handleSelectType("taskGroup")}
                                        className="py-[1px] px-4 ml-2 bg-gray-500 text-(--font) rounded-4xl font-bold"
                                    >
                                        {selectedTaskGroup === "study" ? "Study" : "Work"}
                                    </button>
                                </div>
                            )}
                            <button 
                                onClick={() => handleSelectType("taskCategory")}
                                className={`
                                    ml-2 rounded-4xl border px-4 py-[1px] font-bold transition
                                    ${selectedCategory
                                        ? "shadow-[0_0_0_2px_rgba(255,255,255,0.08)]"
                                        : "border-transparent bg-gray-500 text-(--font)"
                                    }
                                `}
                                style={selectedCategory ? {
                                    backgroundColor: selectedCategory.color_hex,
                                    borderColor: selectedCategory.color_hex,
                                    color: getReadableTextColor(selectedCategory.color_hex),
                                } : undefined}
                            >
                                {selectedCategory?.title ?? "Category"}
                            </button>

                            

                        </div>
                        {/* popup */}
                        {openSelectTaskCategory === "taskStatus" && (
                            <div className="absolute left-[120px] top-[180px] z-20">
                                {renderSelectTaskCategoryBox()}
                            </div>
                        )}
                        {openSelectTaskCategory == "taskType" && (
                            <div className="absolute left-[110px] top-[222px] z-20 ">
                                {renderSelectTaskCategoryBox()}
                            </div>
                        )}
                        {openSelectTaskCategory == "taskGroup" && (
                            <div className="absolute left-[196px] top-[222px] z-20" >
                                {renderSelectTaskCategoryBox()}
                            </div>
                        )}
                        {openSelectTaskCategory == "taskCategory" && (
                            <div className={`absolute top-[222px] z-20 ${selectedTaskType === "task" ? "left-[270px]" : "left-[206px]"}`} >
                                {renderSelectTaskCategoryBox()}
                            </div>
                        )}

                        {/* underline */}
                        <div className="border-t-2 border-(--color2) rounded-4xl mt-4" />

                        {/* text comment*/}
                        <div className="mt-4 h-[60%]">
                            <textarea
                                value={taskComment}
                                onChange={(event) => setTaskComment(event.target.value)}
                                placeholder="Add comment..."
                                className="h-full w-full resize-none rounded-xl border border-[var(--color3)]/20 bg-[var(--color1)] p-4 text-[15px] leading-6 text-[var(--font)] outline-none transition placeholder:text-[var(--color3)]/45 focus:border-[var(--color4)] focus:shadow-[0_0_0_4px_rgba(0,173,181,0.16)]"
                            />
                        </div>

                        <div className="mt-5 flex items-center justify-end gap-3 ">
                            {submitError && (
                                <div className="mr-auto text-[14px] font-bold text-red-400">
                                    {submitError}
                                </div>
                            )}
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={isSubmitting}
                                className="h-11 rounded-xl border border-[var(--color3)]/20 bg-transparent px-5 text-[15px] font-bold text-[var(--color3)] transition hover:border-[var(--color4)] hover:text-[var(--font)] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={submitForm}
                                type="button"
                                disabled={isSubmitDisabled}
                                className="flex h-11 items-center gap-2 rounded-xl bg-[var(--color4)] px-6 text-[15px] font-bold text-[var(--font)] shadow-[0_10px_24px_rgba(0,173,181,0.22)] transition hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-[var(--color3)]/25 disabled:text-[var(--color3)] disabled:shadow-none disabled:hover:brightness-100 disabled:active:scale-100"
                            >
                                {isSubmitting && (
                                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--font)]/30 border-t-[var(--font)]" />
                                )}
                                {isSubmitting ? "กำลังบันทึก..." : "ตกลง"}
                            </button>
                        </div>
                    </div>

                    <div className="rounded-xl border border-[var(--color3)]/20 bg-[var(--color2)] p-4">
                        <CalendarForTask onChange={setTaskDeadline} />
                    </div>
                </div>
            </div>
        </div>
    );
}
