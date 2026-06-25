"use client"

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { getTaskCategories, addTaskCategory, deleteTaskCategory, updateTaskCategory } from "@/services/taskCategoryService";

type TaskCategoryType = "task" | "activity";
type TaskGroup = "study" | "work";

type TaskCategory = {
    id: string;
    task_type: TaskCategoryType;
    task_group: TaskGroup | null;
    title: string;
    color_hex: string;
};

const taskTypeOptions: Array<{
    value: TaskCategoryType;
    label: string;
    description: string;
}> = [
    {
        value: "task",
        label: "Task",
        description: "Study, work, assignments, and planned tasks.",
    },
    {
        value: "activity",
        label: "Activity",
        description: "Travel, exercise, hobbies, and personal activities.",
    },
];

const taskGroupOptions: Array<{
    value: TaskGroup;
    label: string;
    description: string;
}> = [
    {
        value: "study",
        label: "Study",
        description: "Classes, exams, reading, practice, and learning plans.",
    },
    {
        value: "work",
        label: "Work",
        description: "Projects, meetings, clients, deadlines, and office tasks.",
    },
];

const colorPalette = [
    {
        colors: ["#f8fafc", "#e2e8f0", "#cbd5e1", "#94a3b8", "#64748b", "#475569", "#334155", "#1e293b"],
    },
    {
        colors: ["#fee2e2", "#fecaca", "#fca5a5", "#f87171", "#ef4444", "#dc2626", "#b91c1c", "#991b1b"],
    },
    {
        colors: ["#ffedd5", "#fed7aa", "#fdba74", "#fb923c", "#f97316", "#ea580c", "#c2410c", "#9a3412"],
    },
    {
        colors: ["#fef3c7", "#fde68a", "#fcd34d", "#fbbf24", "#f59e0b", "#d97706", "#b45309", "#92400e"],
    },
    {
        colors: ["#dcfce7", "#bbf7d0", "#86efac", "#4ade80", "#22c55e", "#16a34a", "#15803d", "#166534"],
    },
    {
        colors: ["#ccfbf1", "#99f6e4", "#5eead4", "#2dd4bf", "#14b8a6", "#0d9488", "#0f766e", "#115e59"],
    },
    {
        colors: ["#e0f2fe", "#bae6fd", "#7dd3fc", "#38bdf8", "#0ea5e9", "#0284c7", "#0369a1", "#075985"],
    },
    {
        colors: ["#dbeafe", "#bfdbfe", "#93c5fd", "#60a5fa", "#3b82f6", "#2563eb", "#1d4ed8", "#1e40af"],
    },
    {
        colors: ["#ede9fe", "#ddd6fe", "#c4b5fd", "#a78bfa", "#8b5cf6", "#7c3aed", "#6d28d9", "#5b21b6"],
    },
    {
        colors: ["#fce7f3", "#fbcfe8", "#f9a8d4", "#f472b6", "#ec4899", "#db2777", "#be185d", "#9d174d"],
    },
];


export default function Setting_task(){
    const [selectedType, setSelectedType] = useState<TaskCategoryType>("task");
    const [selectedTaskGroup, setSelectedTaskGroup] = useState<TaskGroup>("study");
    const [categoryTitle, setCategoryTitle] = useState("");
    const [selectedColor, setSelectedColor] = useState("#64748b");
    const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
    const [editingTitle, setEditingTitle] = useState("");
    const [editingColor, setEditingColor] = useState("#64748b");
    const [categories, setCategories] = useState<TaskCategory[]>([]);

    // จัดเเบ่งกลุ่มประเภท categories
    const groupedCategories = useMemo(() => ({
        study: (categories || []).filter((category) => category.task_type === "task" && category.task_group === "study"),
        work: (categories || []).filter((category) => category.task_type === "task" && category.task_group === "work"),
        activity: (categories || []).filter((category) => category.task_type === "activity"),
    }), [categories]);


    useEffect(() => {
        fetchTaskCategories();
    }, []);

    async function fetchTaskCategories(){
        try{
            const data = await getTaskCategories();
            setCategories(data);
        }
        catch(error){
            console.error("Error fetching date: ", error);
        }
    }

    function handleSelectType(type: TaskCategoryType){
        setSelectedType(type);
        if(type === "activity"){
            setSelectedTaskGroup("study");
        }
    }

    async function handleAddCategory(event: FormEvent<HTMLFormElement>){
        event.preventDefault();

        const title = categoryTitle.trim();
        if(!title) return;

        try{
            await addTaskCategory(
                selectedType,
                selectedTaskGroup,
                title,
                selectedColor
            )
            await fetchTaskCategories();
        }
        catch(error){
            console.error("Error add data: ", error);
        }        
        setCategoryTitle("");
    }

    async function handleDeleteCategory(categoryId: string){
        try{
            
            await deleteTaskCategory(categoryId);
            await fetchTaskCategories();
        }
        catch(error){
            console.error("Error delete date: ", error);
        }
    }

    function handleStartEditCategory(category: TaskCategory){
        setEditingCategoryId(category.id);
        setEditingTitle(category.title);
        setEditingColor(category.color_hex);
    }

    function handleCancelEditCategory(){
        setEditingCategoryId(null);
        setEditingTitle("");
        setEditingColor("#64748b");
    }

    async function handleSaveCategory(categoryId: string){
        const title = editingTitle.trim();
        if(!title) return;
        
        try{
            await updateTaskCategory(categoryId,title,editingColor);
        }catch(error){

        }
        handleCancelEditCategory();
        await fetchTaskCategories();
    }

    function renderColorPicker(
        currentColor: string,
        onSelectColor: (colorHex: string) => void,
        keyPrefix: string,
        size: "normal" | "compact" = "normal",
    ){
        return(
            <div className="grid grid-cols-8 gap-1">
                {colorPalette.flatMap((group) => (
                    group.colors.map((colorHex) => {
                        const isSelected = currentColor === colorHex;

                        return(
                            <button
                                key={`${keyPrefix}-${colorHex}`}
                                type="button"
                                onClick={() => onSelectColor(colorHex)}
                                aria-label={`Select ${colorHex}`}
                                title={`${colorHex}`}
                                className={`
                                    rounded-[7px] border transition hover:scale-110
                                    ${size === "compact" ? "h-6" : "h-7"}
                                    ${isSelected ? "border-[var(--font)] shadow-[0_0_0_2px_rgba(238,238,238,0.35)]" : "border-black/20"}
                                `}
                                style={{ backgroundColor: colorHex }}
                            />
                        );
                    })
                ))}
            </div>
        );
    }

    function renderCategoryCard(category: TaskCategory){
        const isEditing = editingCategoryId === category.id;

        if(isEditing){
            return(
                <div
                    key={category.id}
                    className="rounded-xl  border border-[var(--color4)]/40 bg-[var(--color1)] p-3"
                >
                    <div className="flex items-center gap-3">
                        <span
                            className="h-4 w-4 shrink-0 rounded-full"
                            style={{ backgroundColor: editingColor }}
                        />
                        <input
                            value={editingTitle}
                            onChange={(event) => setEditingTitle(event.target.value)}
                            className="h-10 min-w-0 flex-1 rounded-lg border border-[var(--color3)]/20 bg-[var(--color2)] px-3 text-[14px] font-bold text-[var(--font)] outline-none transition focus:border-[var(--color4)]"
                        />
                    </div>

                    <div className="mt-3 rounded-xl border border-[var(--color3)]/20 bg-[var(--color2)] p-2">
                        {renderColorPicker(editingColor, setEditingColor, `edit-${category.id}`, "compact")}
                    </div>

                    <div className="mt-3 flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={handleCancelEditCategory}
                            className="rounded-lg px-3 py-1 text-[13px] font-bold text-[var(--color3)] transition hover:bg-white/10 hover:text-[var(--font)]"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={() => handleSaveCategory(category.id, )}
                            disabled={!editingTitle.trim()}
                            className="rounded-lg bg-[var(--color4)] px-3 py-1 text-[13px] font-bold text-[var(--font)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Save
                        </button>
                    </div>
                </div>
            );
        }

        return(
            <div
                key={category.id}
                className="flex min-h-12 items-center justify-between rounded-xl border border-[var(--color3)]/15 bg-(--color1) px-3"
            >
                <div className="flex min-w-0 items-center gap-3">
                    <span
                        className="h-3 w-3 shrink-0 rounded-full"
                        style={{ backgroundColor: category.color_hex }}
                    />
                    <div className="truncate text-[15px] font-bold">{category.title}</div>
                </div>
                <div className="ml-3 flex shrink-0 items-center gap-1">
                    <button
                        type="button"
                        onClick={() => handleStartEditCategory(category)}
                        className="rounded-lg px-2 py-1 text-[13px] font-bold text-[var(--color3)] transition hover:bg-white/10 hover:text-[var(--font)]"
                    >
                        Edit
                    </button>
                    <button
                        type="button"
                        onClick={() => handleDeleteCategory(category.id)}
                        className="rounded-lg px-2 py-1 text-[13px] font-bold text-[var(--color3)] transition hover:bg-white/10 hover:text-red-200"
                    >
                        Delete
                    </button>
                </div>
            </div>
        );
    }

    return(
        <div className="m-4 max-w-[1080px] text-[var(--font)]">
            <div className="mb-5">
                <h2 className="text-[28px] font-bold">Task Categories</h2>
            </div>

            <div className="grid grid-cols-1 max-w-[320px] gap-6 lg:grid-cols-[320px_720px]">
                <form
                    onSubmit={handleAddCategory}
                    className="rounded-2xl border border-[var(--color3)]/20 bg-[var(--color2)] p-5 shadow-[inset_4px_2px_5px_rgba(255,255,255,0.12),0_12px_28px_rgba(0,0,0,0.28)]"
                >
                    <div className="text-[18px] font-bold">Add Category</div>

                    <div className="mt-5">
                        <div className="mb-2 text-[14px] font-bold text-[var(--color3)]">Type</div>
                        <div className="grid grid-cols-2 gap-2">
                            {taskTypeOptions.map((option) => {
                                const isSelected = selectedType === option.value;

                                return(
                                    <button
                                        key={option.value}
                                        type="button"
                                        onClick={() => handleSelectType(option.value)}
                                        className={`
                                            rounded-xl border p-3 text-left transition
                                            ${isSelected
                                                ? "border-[var(--color4)] bg-[var(--color4)]/10 text-[var(--color4)]"
                                                : "border-[var(--color3)]/20 bg-[var(--color1)] text-[var(--color3)] hover:border-[var(--color4)] hover:text-[var(--font)]"
                                            }
                                        `}
                                    >
                                        <div className="text-[15px] font-bold">{option.label}</div>
                                    </button>
                                );
                            })}
                        </div>
                        <p className="mt-3 min-h-[40px] text-[13px] leading-5 text-[var(--color3)]">
                            {taskTypeOptions.find((option) => option.value === selectedType)?.description}
                        </p>
                    </div>

                    {selectedType === "task" && (
                        <div className="mt-4">
                            <div className="mb-2 text-[14px] font-bold text-[var(--color3)]">Task group</div>
                            <div className="grid grid-cols-2 gap-2">
                                {taskGroupOptions.map((option) => {
                                    const isSelected = selectedTaskGroup === option.value;

                                    return(
                                        <button
                                            key={option.value}
                                            type="button"
                                            onClick={() => setSelectedTaskGroup(option.value)}
                                            className={`
                                                rounded-xl border p-3 text-left transition
                                                ${isSelected
                                                    ? "border-[var(--color4)] bg-[var(--color4)]/10 text-[var(--color4)]"
                                                    : "border-[var(--color3)]/20 bg-[var(--color1)] text-[var(--color3)] hover:border-[var(--color4)] hover:text-[var(--font)]"
                                                }
                                            `}
                                        >
                                            <div className="text-[15px] font-bold">{option.label}</div>
                                        </button>
                                    );
                                })}
                            </div>
                            <p className="mt-3 min-h-[40px] text-[13px] leading-5 text-[var(--color3)]">
                                {taskGroupOptions.find((option) => option.value === selectedTaskGroup)?.description}
                            </p>
                        </div>
                    )}

                    <label className="mt-5 block">
                        <span className="mb-2 block text-[14px] font-bold text-[var(--color3)]">Category name</span>
                        <input
                            value={categoryTitle}
                            onChange={(event) => setCategoryTitle(event.target.value)}
                            placeholder={selectedType === "task" ? "Math, Exam, Meeting" : "Travel, Exercise, Family"}
                            className="h-12 w-full rounded-xl border border-[var(--color3)]/20 bg-[var(--color1)] px-4 text-[15px] font-medium text-[var(--font)] outline-none transition placeholder:text-[var(--color3)]/45 focus:border-[var(--color4)] focus:shadow-[0_0_0_4px_rgba(0,173,181,0.16)]"
                        />
                    </label>

                    <div className="mt-5">
                        <div className="mb-2 flex items-center justify-between gap-3">
                            <div className="text-[14px] font-bold text-[var(--color3)]">Category color</div>
                            <div className="flex items-center gap-2 text-[13px] font-bold text-[var(--color3)]">
                                <span
                                    className="h-4 w-4 rounded-full border border-white/30"
                                    style={{ backgroundColor: selectedColor }}
                                />
                                {selectedColor}
                            </div>
                        </div>

                        <div className={`${selectedType === "task" ? "h-[146px]" : "h-[300px]"} overflow-y-auto rounded-xl border border-[var(--color3)]/20 bg-[var(--color1)] p-3`}>
                            {renderColorPicker(selectedColor, setSelectedColor, "create")}
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={!categoryTitle.trim()}
                        className="mt-5 flex h-12 w-full items-center justify-center rounded-xl bg-(--color4) text-[16px] font-bold text-(--font) transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Add Category
                    </button>
                </form>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    <section className="flex h-[720px]  flex-col rounded-2xl border border-[var(--color3)]/20 bg-(--color2) p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-[18px] font-bold">Task</div>
                                <div className="mt-1 text-[13px] text-[var(--color3)]">
                                    {groupedCategories.study.length + groupedCategories.work.length} categories
                                </div>
                            </div>
                            <div className="rounded-full bg-[var(--color1)] px-3 py-1 text-[13px] font-bold text-[var(--color4)]">
                                task
                            </div>
                        </div>

                        <div className="mt-4 grid min-h-0 flex-1 grid-rows-2 gap-3">
                            {taskGroupOptions.map((group) => {
                                const groupCategories = groupedCategories[group.value];

                                return(
                                    <div
                                        key={group.value}
                                        className="flex min-h-0 flex-col rounded-xl border border-[var(--color3)]/15 bg-[var(--color1)]/45 p-3"
                                    >
                                        <div className="mb-2 flex shrink-0 items-center justify-between">
                                            <div className="text-[14px] font-bold text-[var(--color3)]">{group.label}</div>
                                            <div className="text-[12px] font-bold text-[var(--color3)]">
                                                {groupCategories.length}
                                            </div>
                                        </div>

                                        <div className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
                                            {groupCategories.length === 0 ? (
                                                <div className="rounded-xl border border-dashed border-[var(--color3)]/25 p-4 text-center text-[14px] text-[var(--color3)]">
                                                    No categories
                                                </div>
                                            ) : (
                                                groupCategories.map((category) => (
                                                    renderCategoryCard(category)
                                                ))
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>

                    <section className="rounded-2xl h-[720px] overflow-scroll border border-[var(--color3)]/20 bg-[var(--color2)] p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-[18px] font-bold">Activity</div>
                                <div className="mt-1 text-[13px] text-[var(--color3)]">
                                    {groupedCategories.activity.length} categories
                                </div>
                            </div>
                            <div className="rounded-full bg-[var(--color1)] px-3 py-1 text-[13px] font-bold text-[var(--color4)]">
                                activity
                            </div>
                        </div>

                        <div className="mt-4 space-y-2">
                            {groupedCategories.activity.length === 0 ? (
                                <div className="rounded-xl border border-dashed border-[var(--color3)]/25 p-4 text-center text-[14px] text-[var(--color3)]">
                                    No categories
                                </div>
                            ) : (
                                groupedCategories.activity.map((category) => (
                                    renderCategoryCard(category)
                                ))
                            )}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
