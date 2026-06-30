"use client"

import { getTaskCategories } from "@/services/taskCategoryService";
import { deleteTimeline_item, updateTimeline_item } from "@/services/timelineService";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

type EditTimelineProps = {
    item: Timeline_item;
    onClose: () => void;
    onUpdated: () => Promise<void>;
};

type SelectBoxType = "" | "taskType" | "taskGroup" | "taskCategory";

function getReadableTextColor(colorHex: string){
    const hex = colorHex.replace("#", "");
    const red = parseInt(hex.slice(0, 2), 16);
    const green = parseInt(hex.slice(2, 4), 16);
    const blue = parseInt(hex.slice(4, 6), 16);
    const brightness = (red * 299 + green * 587 + blue * 114) / 1000;

    return brightness > 150 ? "var(--color1)" : "var(--font)";
}

export function EditTimeline({item, onClose, onUpdated}: EditTimelineProps){
    const router = useRouter();
    const [title, setTitle] = useState(item.title);
    const [description, setDescription] = useState(item.description ?? "");
    const [startDate, setStartDate] = useState(item.start_date);
    const [endDate, setEndDate] = useState(item.end_date);
    const [startTime, setStartTime] = useState(item.start_time?.slice(0, 5) ?? "00:00");
    const [endTime, setEndTime] = useState(item.end_time?.slice(0, 5) ?? "01:00");
    const [categories, setCategories] = useState<TaskCategory[]>([]);
    const [selectedTaskType, setSelectedTaskType] = useState<TaskCategoryType>(item.task_categories.task_type);
    const [selectedTaskGroup, setSelectedTaskGroup] = useState<TaskGroup>(item.task_categories.task_group ?? "study");
    const [selectedTaskCategory, setSelectedTaskCategory] = useState(item.category_id);
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

    const isBusy = isSubmitting || isDeleting;
    const isTimeInvalid = useMemo(() => {
        if (!startDate || !endDate || !startTime || !endTime) return false;
        
        // ถ้ารวมวันที่และเวลาเข้าด้วยกันเพื่อเปรียบเทียบเชิง String (เช่น "2026-06-28T16:00")
        const startDateTime = `${startDate}T${startTime}`;
        const endDateTime = `${endDate}T${endTime}`;
        
        // ถ้าเวลาเริ่ม มากกว่าหรือเท่ากับ เวลาจบ ให้ถือว่า Invalid (ผิดพลาด)
        return startDateTime >= endDateTime;
    }, [startDate, endDate, startTime, endTime]);

    

    const isSubmitDisabled = !title.trim() || !selectedTaskCategory || !startDate || !endDate || !startTime || !endTime || isBusy || isTimeInvalid;
    const selectedCategory = selectedTaskCategory
        ? selectedCategoryList.find((category) => category.id === selectedTaskCategory)
            ?? categories.find((category) => category.id === selectedTaskCategory)
            ?? item.task_categories
        : undefined;

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
            const category = categories.find((item) => item.id === selectedTaskCategory);
            if(!category){
                return;
            }

            setSelectedTaskType(category.task_type);
            if(category.task_type === "task" && category.task_group){
                setSelectedTaskGroup(category.task_group);
            }
        }, 0);

        return () => window.clearTimeout(timeoutId);
    }, [categories, selectedTaskCategory]);

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

    async function handleSubmit(){
        if(isSubmitDisabled){
            return;
        }

        setIsSubmitting(true);
        setSubmitError("");

        try{
            await updateTimeline_item({
                id: item.id,
                category_id: selectedTaskCategory,
                title,
                startDate,
                endDate,
                startTime,
                endTime,
                description,
            });

            await onUpdated();
            onClose();
            router.refresh();
        }
        catch(error){
            console.error("Error update timeline item: ", error);
            setSubmitError("Update timeline failed. Please try again.");
            setIsSubmitting(false);
        }
    }

    async function handleDelete(){
        if(isBusy){
            return;
        }

        const shouldDelete = window.confirm("Delete this timeline?");
        if(!shouldDelete){
            return;
        }

        setIsDeleting(true);
        setSubmitError("");

        try{
            await deleteTimeline_item(item.id);
            await onUpdated();
            onClose();
            router.refresh();
        }
        catch(error){
            console.error("Error delete timeline item: ", error);
            setSubmitError("Delete timeline failed. Please try again.");
            setIsDeleting(false);
        }
    }

    function renderSelectTaskCategoryBox(){
        return(
            <div className={`absolute w-[220px] rounded-2xl border border-[var(--color3)]/20 bg-[var(--color2)] p-2 text-[var(--font)] shadow-[0_16px_36px_rgba(0,0,0,0.45)] ${openSelectTaskCategory == "taskGroup" ? "translate-x-36" : openSelectTaskCategory == "taskCategory" ? "translate-x-56" : ""}`}>
                {openSelectTaskCategory === "taskType" && (
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
                            <div className="text-[16px] font-bold">Task</div>
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
                            <div className="text-[16px] font-bold">Activity</div>
                            {selectedTaskType === "activity" && (
                                <span className="material-symbols-outlined !text-[20px]">check</span>
                            )}
                        </button>
                    </div>
                )}

                {openSelectTaskCategory === "taskGroup" && (
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
                            <div className="text-[16px] font-bold">Study</div>
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
                            <div className="text-[16px] font-bold">Work</div>
                            {selectedTaskGroup === "work" && (
                                <span className="material-symbols-outlined !text-[20px]">check</span>
                            )}
                        </button>
                    </div>
                )}

                {openSelectTaskCategory === "taskCategory" && (
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
            </div>
        );
    }

    return(
        <div
            className="fixed inset-0 z-[999] flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-timeline-title"
        >
            <div className="absolute inset-0 bg-black/70" />

            <div className="relative z-10 w-full max-w-[820px] rounded-2xl bg-[var(--color1)] p-4 text-[var(--font)] shadow-[0_0_20px_rgba(90,187,194,0.5)]">
                <div className="flex items-start justify-between gap-4">
                    <h2 id="edit-timeline-title" className="text-[32px] font-bold text-(--font)/70">
                        Edit Timeline
                    </h2>

                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isBusy}
                        className="flex justify-center rounded-xl border border-[var(--color3)]/20 bg-[var(--color1)] px-4 py-2 text-[14px] font-bold text-[var(--font)] transition hover:border-[var(--color4)] hover:text-[var(--color4)] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <div className="mt-4">
                    <div className="rounded-xl border-t border-dashed border-[var(--color3)]/25 p-4">
                        <input
                            value={title}
                            onChange={(event) => setTitle(event.target.value)}
                            className="w-full bg-transparent text-[32px] font-bold text-[var(--font)] outline-none"
                        />
                        
                            

                        <div className="mt-3 flex flex-wrap items-center gap-2">
                            <div className="text-[15px] font-bold text-[var(--color3)]">Category</div>
                            <button
                                type="button"
                                onClick={() => handleSelectType("taskType")}
                                className="rounded-4xl bg-gray-500 px-4 py-[3px] text-[14px] font-bold text-(--font)"
                            >
                                {selectedTaskType === "task" ? "Task" : "Activity"}
                            </button>

                            {selectedTaskType === "task" && (
                                <button
                                    type="button"
                                    onClick={() => handleSelectType("taskGroup")}
                                    className="rounded-4xl bg-gray-500 px-4 py-[3px] text-[14px] font-bold text-(--font)"
                                >
                                    {selectedTaskGroup === "study" ? "Study" : "Work"}
                                </button>
                            )}

                            <button
                                type="button"
                                onClick={() => handleSelectType("taskCategory")}
                                className={`
                                    max-w-full rounded-4xl border px-4 py-[3px] text-[14px] font-bold transition
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
                                <span className="block truncate">{selectedCategory?.title ?? "Category"}</span>
                            </button>
                        </div>

                        {openSelectTaskCategory && (
                            <div className="mt-3">
                                {renderSelectTaskCategoryBox()}
                            </div>
                        )}

                        <div className="mt-4 grid grid-cols-2 gap-3">
                            <label className="block">
                                <span className="text-[12px] font-bold text-[var(--color3)]/65">Start date</span>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(event) => setStartDate(event.target.value)}
                                    className="mt-2 h-11 w-full rounded-xl border border-[var(--color3)]/15 bg-[var(--color2)] px-4 text-[14px] font-bold text-[var(--font)] outline-none transition focus:border-[var(--color4)]"
                                />
                            </label>
                            <label className="block">
                                <span className="text-[12px] font-bold text-[var(--color3)]/65">End date</span>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(event) => setEndDate(event.target.value)}
                                    className="mt-2 h-11 w-full rounded-xl border border-[var(--color3)]/15 bg-[var(--color2)] px-4 text-[14px] font-bold text-[var(--font)] outline-none transition focus:border-[var(--color4)]"
                                />
                            </label>
                            <label className="block">
                                <span className="text-[12px] font-bold text-[var(--color3)]/65">Start time</span>
                                <input
                                    type="time"
                                    value={startTime}
                                    onChange={(event) => setStartTime(event.target.value)}
                                    className="mt-2 h-11 w-full rounded-xl border border-[var(--color3)]/15 bg-[var(--color2)] px-4 text-[14px] font-bold text-[var(--font)] outline-none transition focus:border-[var(--color4)]"
                                />
                            </label>
                            <label className="block">
                                <span className="text-[12px] font-bold text-[var(--color3)]/65">End time</span>
                                <input
                                    type="time"
                                    value={endTime}
                                    onChange={(event) => setEndTime(event.target.value)}
                                    className="mt-2 h-11 w-full rounded-xl border border-[var(--color3)]/15 bg-[var(--color2)] px-4 text-[14px] font-bold text-[var(--font)] outline-none transition focus:border-[var(--color4)]"
                                />
                            </label>
                        </div>

                        <label className="mt-4 block">
                            <span className="text-[12px] font-bold text-[var(--color3)]/65">Comment</span>
                            <textarea
                                value={description}
                                onChange={(event) => setDescription(event.target.value)}
                                className="mt-2 h-[150px] w-full resize-none rounded-xl border border-[var(--color3)]/15 bg-[var(--color2)] p-4 text-[14px] leading-6 text-[var(--font)] outline-none transition placeholder:text-[var(--color3)]/35 focus:border-[var(--color4)]"
                                placeholder="Add comment..."
                            />
                        </label>
                    </div>
                </div>

                <div className="mt-5 flex items-center justify-end gap-3">
                    <div className="mr-auto flex min-w-0 items-center gap-3">
                        <button
                            type="button"
                            onClick={handleDelete}
                            disabled={isBusy}
                            className="flex h-11 items-center gap-2 rounded-xl border border-red-400/35 bg-red-500/10 px-5 text-[15px] font-bold text-red-300 transition hover:border-red-300 hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-60"
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
                        className="h-11 rounded-xl border border-[var(--color3)]/20 bg-transparent px-5 text-[15px] font-bold text-[var(--color3)] transition hover:border-[var(--color4)] hover:text-[var(--font)] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleSubmit}
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
        </div>
    );
}
