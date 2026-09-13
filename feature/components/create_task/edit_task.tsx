"use client"

import { CalendarForTask } from "@/feature/components/create_task/calendar_for_task";
import { useTaskMutations } from "@/hooks/task_items/useTaskMutations";
import { getTaskCategories } from "@/services/taskCategoryService";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";


const statusColors: Record<TaskStatus, string> = {
    not_started: "bg-[#bebebe]",
    in_progress: "bg-[#FCC951]",
    done: "bg-[#5EC45E]",
};

type SelectBoxType = "" | "taskType" | "taskGroup" | "taskCategory"| "taskStatus";
type EditTaskProps = {
    task: EditableTask;
    onClose: () => void;
    onUpdated?: () => Promise<void> | void;
};

function getReadableTextColor(colorHex: string){
    const hex = colorHex.replace("#", "");
    const red = parseInt(hex.slice(0, 2), 16);
    const green = parseInt(hex.slice(2, 4), 16);
    const blue = parseInt(hex.slice(4, 6), 16);
    const brightness = (red * 299 + green * 587 + blue * 114) / 1000;

    return brightness > 150 ? "var(--color1)" : "var(--font)";
}

function getInitialDeadline(task: EditableTask): TaskDeadlineValue{
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

export function EditTask({task, onClose, onUpdated}: EditTaskProps){

    const { updateTask, deleteTask } = useTaskMutations();


    const router = useRouter();
    const [title, setTitle] = useState(task.title ?? "");
    const [taskComment, setTaskComment] = useState(task.description ?? "");
    const [taskDeadline, setTaskDeadline] = useState<TaskDeadlineValue>(() => getInitialDeadline(task));
    const [categories, setCategories] = useState<TaskCategory[]>([]);

    const [selectedTaskType, setSelectedTaskType] = useState<TaskCategoryType>("task");
    const [selectedTaskGroup, setSelectedTaskGroup] = useState<TaskGroup>("study");
    const [selectedTaskCategories, setSelectedTaskCategories] = useState<string[]>(() => {
        if (task.category_ids && task.category_ids.length > 0) {
            return task.category_ids;
        }
        return task.category_id ? [task.category_id] : [];
    });
    const [selectedStatus, setSelectedStatus] = useState<TaskStatus>(task.task_status || "not_started");


    const [openSelectTaskCategory, setOpenSelectTaskCategory] = useState<SelectBoxType>("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [submitError, setSubmitError] = useState("");

    const groupedCategories = useMemo(() => ({
        study: categories.filter((category) => category.task_type === "task" && category.task_group === "study"),
        work: categories.filter((category) => category.task_type === "task" && category.task_group === "work"),
        activity: categories.filter((category) => category.task_type === "activity"),
    }), [categories]);

    const selectedCategoryList = selectedTaskType === "activity"
        ? groupedCategories.activity
        : groupedCategories[selectedTaskGroup];

    const selectedCategoryObjects = useMemo(() => {
        return categories.filter((cat) => selectedTaskCategories.includes(cat.id));
    }, [categories, selectedTaskCategories]);

    const isBusy = isSubmitting || isDeleting;
    const isSubmitDisabled = selectedTaskCategories.length === 0 || !title.trim() || isBusy;

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

    useEffect(() => {
        const timeoutId = window.setTimeout(() => {
            const firstCatId = selectedTaskCategories[0];
            if (!firstCatId) {
                return;
            }
            const category = categories.find((item) => item.id === firstCatId);
            if(!category){
                return;
            }

            setSelectedTaskType(category.task_type);
            if(category.task_type === "task" && category.task_group){
                setSelectedTaskGroup(category.task_group);
            }
        }, 0);

        return () => window.clearTimeout(timeoutId);
    }, [categories, selectedTaskCategories]);

    function handleSelectType(type: SelectBoxType){
        if(type === openSelectTaskCategory){
            setOpenSelectTaskCategory("");
            return;
        }

        setOpenSelectTaskCategory(type);
    }

    function handleSelectTaskType(type: TaskCategoryType){
        setSelectedTaskType(type);
        setSelectedTaskCategories([]);
        if(type === "activity"){
            setSelectedTaskGroup("study");
        }
    }

    async function handleDeleteTask(){
        if(isBusy){
            return;
        }

        const shouldDelete = window.confirm("Delete this task?");
        if(!shouldDelete){
            return;
        }

        setIsDeleting(true);
        setSubmitError("");

        try{
            await deleteTask(task.id);
            await onUpdated?.();
            onClose();
            router.replace("/home_page/day");
            router.refresh();
        }
        catch(error){
            console.error("Error delete task: ", error);
            setSubmitError("Delete task failed. Please try again.");
            setIsDeleting(false);
        }
    }

    function handleSelectTaskGroup(group: TaskGroup){
        setSelectedTaskGroup(group);
        setSelectedTaskCategories([]);
    }

    function handleSelectTaskCategory(categoryId: string){
        setSelectedTaskCategories((prev) => {
            if (prev.includes(categoryId)) {
                return prev.filter((id) => id !== categoryId);
            } else {
                return [...prev, categoryId];
            }
        });
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
            await updateTask({
                id: task.id,
                category_ids: selectedTaskCategories,
                title,
                position: task.position,
                date: taskDeadline,
                task_status: selectedStatus,
                description: taskComment,
            });

            await onUpdated?.();
            onClose();
            router.replace("/home_page/day");
            router.refresh();
        }
        catch(error){
            console.error("Error update task: ", error);
            setSubmitError("Update task failed. Please try again.");
            setIsSubmitting(false);
        }
    }

    function renderSelectTaskCategoryBox(){
       return(
         <div className="min-w-[180px] rounded-2xl border border-[var(--color3)]/20 bg-[var(--color2)] p-2 text-[var(--font)] shadow-[0_16px_36px_rgba(0,0,0,0.45)]">
            {openSelectTaskCategory == "taskType" && (
                <div className="space-y-2">
                    <button
                        type="button"
                        onClick={() => handleSelectTaskType("task")}
                        className={`
                            flex w-full items-center justify-between rounded-xl border p-3 text-left transition cursor-pointer
                            ${selectedTaskType === "task"
                                ? "border-[var(--color4)] bg-[var(--color4)]/10 text-[var(--color4)]"
                                : "border-transparent bg-[var(--color1)] text-[var(--font)]/80 hover:border-[var(--color4)]/60 hover:text-[var(--font)]"
                            }
                        `}
                    >
                        <div className="text-[16px] font-bold">Task</div>
                        {selectedTaskType === "task" && (
                            <span className="material-symbols-outlined !text-[20px]">check</span>
                        )}
                    </button>

                    <button
                        type="button"
                        onClick={() => handleSelectTaskType("activity")}
                        className={`
                            flex w-full items-center justify-between rounded-xl border p-3 text-left transition cursor-pointer
                            ${selectedTaskType === "activity"
                                ? "border-[var(--color4)] bg-[var(--color4)]/10 text-[var(--color4)]"
                                : "border-transparent bg-[var(--color1)] text-[var(--font)]/80 hover:border-[var(--color4)]/60 hover:text-[var(--font)]"
                            }
                        `}
                    >
                        <div className="text-[16px] font-bold">Activity</div>
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
                            flex w-full items-center justify-between rounded-xl border p-3 text-left transition cursor-pointer
                            ${selectedTaskGroup === "study"
                                ? "border-[var(--color4)] bg-[var(--color4)]/10 text-[var(--color4)]"
                                : "border-transparent bg-[var(--color1)] text-[var(--font)]/80 hover:border-[var(--color4)]/60 hover:text-[var(--font)]"
                            }
                        `}
                    >
                        <div className="text-[16px] font-bold">Study</div>
                        {selectedTaskGroup === "study" && (
                            <span className="material-symbols-outlined !text-[20px]">check</span>
                        )}
                    </button>

                    <button
                        type="button"
                        onClick={() => handleSelectTaskGroup("work")}
                        className={`
                            flex w-full items-center justify-between rounded-xl border p-3 text-left transition cursor-pointer
                            ${selectedTaskGroup === "work"
                                ? "border-[var(--color4)] bg-[var(--color4)]/10 text-[var(--color4)]"
                                : "border-transparent bg-[var(--color1)] text-[var(--font)]/80 hover:border-[var(--color4)]/60 hover:text-[var(--font)]"
                            }
                        `}
                    >
                        <div className="text-[16px] font-bold">Work</div>
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
                        selectedCategoryList.map((category) => {
                            const isSelected = selectedTaskCategories.includes(category.id);
                            return (
                                <button
                                    key={category.id}
                                    type="button"
                                    onClick={() => handleSelectTaskCategory(category.id)}
                                    className={`
                                        flex w-full items-center justify-between gap-3 rounded-xl border p-3 text-left transition cursor-pointer
                                        ${isSelected
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
                                    {isSelected && (
                                        <span className="material-symbols-outlined !text-[20px]">check</span>
                                    )}
                                </button>
                            );
                        })
                    )}
                </div>
            )}

            {openSelectTaskCategory === "taskStatus" && (
                <div className="space-y-2">
                    <button
                        type="button"
                        onClick={() => handleSelectStatus("not_started")}
                        className={`
                            flex w-full items-center justify-between rounded-xl border p-3 text-left transition cursor-pointer
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
                            flex w-full items-center justify-between rounded-xl border p-3 text-left transition cursor-pointer
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
                            flex w-full items-center justify-between rounded-xl border p-3 text-left transition cursor-pointer
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
            aria-labelledby="edit-task-title"
        >
            <div className="absolute inset-0 bg-black/70" />

            <div className="relative z-10 w-full max-w-[920px] rounded-2xl bg-[var(--color1)] p-4 text-[var(--font)] shadow-[0_0_20px_rgba(90,187,194,0.5)]">
                <div className="flex items-start justify-between gap-4">
                    <h2 id="edit-task-title" className="text-[32px] font-bold text-(--font)/70">
                        Edit Task
                    </h2>

                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isBusy}
                        className="flex justify-center rounded-xl border border-[var(--color3)]/20 bg-[var(--color1)] px-4 py-2 text-[14px] font-bold text-[var(--font)] transition hover:border-[var(--color4)] hover:text-[var(--color4)] disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
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
                                className="h-full text-[32px] font-bold bg-transparent border-none outline-none text-white w-full"
                            />
                        </div>


                        {/* status bar */}
                        <div className="relative flex items-center mt-4">
                            <span className="material-symbols-outlined">
                                stat_0
                            </span>
                            <div className="ml-2 text-[16px] font-bold">Status:</div>
                            <button
                                type="button"
                                onClick={() => handleSelectType("taskStatus")}
                                className="ml-2 flex items-center gap-2 rounded-4xl bg-gray-500 px-4 py-[1px] font-bold text-(--font) cursor-pointer"
                            >
                                <span className={`h-3 w-3 shrink-0 rounded-full ${statusColors[selectedStatus]}`} />
                                <span className="capitalize">{selectedStatus.replace("_", " ")}</span>
                            </button>

                            {openSelectTaskCategory === "taskStatus" && (
                                <div className="absolute left-[120px] top-full mt-2 z-50">
                                    {renderSelectTaskCategoryBox()}
                                </div>
                            )}
                        </div>


                        <div className="flex flex-wrap items-center mt-4 gap-x-2 gap-y-3">
                            <span className="material-symbols-outlined !text-[24px]">
                                format_list_bulleted
                            </span>
                            <div className="text-[16px] font-bold">Type:</div>
                            
                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={() => handleSelectType("taskType")}
                                    className="px-4 py-[1px] bg-gray-500 text-(--font) rounded-4xl font-bold cursor-pointer"
                                >
                                    {selectedTaskType === "task" ? "Task" : "Activity"}
                                </button>
                                {openSelectTaskCategory == "taskType" && (
                                    <div className="absolute left-0 top-full mt-2 z-50">
                                        {renderSelectTaskCategoryBox()}
                                    </div>
                                )}
                            </div>

                            {selectedTaskType == "task" && (
                                <div className="relative">
                                    <button
                                        type="button"
                                        onClick={() => handleSelectType("taskGroup")}
                                        className="px-4 py-[1px] bg-gray-500 text-(--font) rounded-4xl font-bold cursor-pointer"
                                    >
                                        {selectedTaskGroup === "study" ? "Study" : "Work"}
                                    </button>
                                    {openSelectTaskCategory == "taskGroup" && (
                                        <div className="absolute left-0 top-full mt-2 z-50">
                                            {renderSelectTaskCategoryBox()}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Multiple Category selector container */}
                            {selectedCategoryObjects.map((category) => (
                                <div
                                    key={category.id}
                                    className="flex items-center gap-1 rounded-4xl border px-3 py-[1px] font-bold text-xs transition"
                                    style={{
                                        backgroundColor: category.color_hex,
                                        borderColor: category.color_hex,
                                        color: getReadableTextColor(category.color_hex),
                                    }}
                                >
                                    <span className="text-[16px] font-bold">{category.title}</span>
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleSelectTaskCategory(category.id);
                                        }}
                                        className="flex items-center justify-center rounded-full hover:bg-white/25 p-0.5 cursor-pointer"
                                        aria-label={`Remove category ${category.title}`}
                                    >
                                        <span className="material-symbols-outlined !text-[12px] leading-none">close</span>
                                    </button>
                                </div>
                            ))}
                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={() => handleSelectType("taskCategory")}
                                    className="flex items-center rounded-4xl bg-gray-500 hover:bg-gray-400 px-3 py-[2.5px] font-bold text-xs text-(--font) transition cursor-pointer "
                                >
                                    <span className="material-symbols-outlined !text-[14px] leading-none">add</span>
                                    <span className="text-[16px] font-bold">Category</span>
                                </button>

                                {openSelectTaskCategory == "taskCategory" && (
                                    <div className="absolute left-0 top-full mt-2 z-50">
                                        {renderSelectTaskCategoryBox()}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="mt-4 rounded-4xl border-t-2 border-(--color2)" />

                        <div className="mt-4 h-[55%]">
                            <textarea
                                value={taskComment}
                                onChange={(event) => setTaskComment(event.target.value)}
                                placeholder="Add comment..."
                                className="h-full w-full resize-none rounded-xl border border-[var(--color3)]/20 bg-[var(--color1)] p-4 text-[15px] leading-6 text-[var(--font)] outline-none transition placeholder:text-[var(--color3)]/45 focus:border-[var(--color4)] focus:shadow-[0_0_0_4px_rgba(0,173,181,0.16)]"
                            />
                        </div>

                        <div className="mt-5 flex items-center justify-end gap-3">
                            <div className="mr-auto flex min-w-0 items-center gap-3">
                                <button
                                    type="button"
                                    onClick={handleDeleteTask}
                                    disabled={isBusy}
                                    className="mr-auto flex h-11 items-center gap-2 rounded-xl border border-red-400/35 bg-red-500/10 px-5 text-[15px] font-bold text-red-300 transition hover:border-red-300 hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
                                >
                                    {isDeleting && (
                                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-red-200/30 border-t-red-200" />
                                    )}
                                    {isDeleting ? "กำลังลบ..." : "Delete"}
                                </button>
                                {submitError && (
                                    <div className="text-[14px] font-bold text-red-400">
                                        {submitError}
                                    </div>
                                )}
                            </div>
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={isBusy}
                                className="h-11 rounded-xl border border-[var(--color3)]/20 bg-transparent px-5 text-[15px] font-bold text-[var(--color3)] transition hover:border-[var(--color4)] hover:text-[var(--font)] disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={submitForm}
                                disabled={isSubmitDisabled}
                                className="flex h-11 items-center gap-2 rounded-xl bg-[var(--color4)] px-6 text-[15px] font-bold text-[var(--font)] shadow-[0_10px_24px_rgba(0,173,181,0.22)] transition hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-[var(--color3)]/25 disabled:text-[var(--color3)] disabled:shadow-none disabled:hover:brightness-100 disabled:active:scale-100 cursor-pointer"
                            >
                                {isSubmitting && (
                                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--font)]/30 border-t-[var(--font)]" />
                                )}
                                {isSubmitting ? "กำลังบันทึก..." : "ตกลง"}
                            </button>
                        </div>
                    </div>

                    <div className="rounded-xl border border-[var(--color3)]/20 bg-[var(--color2)] p-4">
                        <CalendarForTask value={taskDeadline} onChange={setTaskDeadline} />
                    </div>
                </div>
            </div>
        </div>
    );
}
