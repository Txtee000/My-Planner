"use client"

import { getTaskCategories } from "@/services/taskCategoryService";
import { useEffect, useMemo, useState } from "react";

export type TimelineFilterValue = {
    taskType: "" | TaskCategoryType;
    taskGroup: "" | TaskGroup;
    categoryId: string;
    dateFrom: string;
    dateTo: string;
    timeFrom: string;
    timeTo: string;
};

export const emptyTimelineFilter: TimelineFilterValue = {
    taskType: "",
    taskGroup: "",
    categoryId: "",
    dateFrom: "",
    dateTo: "",
    timeFrom: "",
    timeTo: "",
};

type TimelineFilterProps = {
    value: TimelineFilterValue;
    onApply: (filter: TimelineFilterValue) => void;
    onClear: () => void;
    onClose: () => void;
};

export function TimelineFilter({value, onApply, onClear, onClose}: TimelineFilterProps){
    const [draftFilter, setDraftFilter] = useState<TimelineFilterValue>(value);
    const [categories, setCategories] = useState<TaskCategory[]>([]);

    useEffect(() => {
        const timeoutId = window.setTimeout(() => {
            setDraftFilter(value);
        }, 0);

        return () => window.clearTimeout(timeoutId);
    }, [value]);

    useEffect(() => {
        const timeoutId = window.setTimeout(() => {
            async function fetchCategories(){
                try{
                    const data = await getTaskCategories();
                    setCategories(Array.isArray(data) ? data : []);
                }
                catch(error){
                    console.error("Error fetching task categories: ", error);
                    setCategories([]);
                }
            }

            void fetchCategories();
        }, 0);

        return () => window.clearTimeout(timeoutId);
    }, []);

    const filteredCategories = useMemo(() => {
        return categories.filter((category) => {
            if(draftFilter.taskType && category.task_type !== draftFilter.taskType){
                return false;
            }

            if(draftFilter.taskGroup && category.task_group !== draftFilter.taskGroup){
                return false;
            }

            return true;
        });
    }, [categories, draftFilter.taskGroup, draftFilter.taskType]);

    function updateFilter(nextFilter: Partial<TimelineFilterValue>){
        setDraftFilter((currentFilter) => ({
            ...currentFilter,
            ...nextFilter,
        }));
    }

    function handleSelectTaskType(taskType: "" | TaskCategoryType){
        updateFilter({
            taskType,
            taskGroup: "",
            categoryId: "",
        });
    }

    function handleSelectTaskGroup(taskGroup: "" | TaskGroup){
        updateFilter({
            taskGroup,
            categoryId: "",
        });
    }

    function handleClear(){
        setDraftFilter(emptyTimelineFilter);
        onClear();
    }

    return(
        <div className="absolute right-0 top-[54px] z-30 w-[360px] rounded-2xl border border-[var(--color3)]/20 bg-[var(--color1)] p-4 text-[var(--font)] shadow-[0_18px_45px_rgba(0,0,0,0.45)]">
            <div className="flex items-center justify-between">
                <div className="text-[18px] font-bold">Filter Timeline</div>
                <button
                    type="button"
                    onClick={onClose}
                    className="rounded-xl border border-[var(--color3)]/20 p-2 transition hover:border-[var(--color4)] hover:text-[var(--color4)] leading-none"
                    aria-label="Close timeline filter"
                >
                    <span className="material-symbols-outlined !text-[20px]">close</span>
                </button>
            </div>

            <div className="mt-4 space-y-4">
                <div>
                    <div className="text-[13px] font-bold text-[var(--color3)]">Type</div>
                    <div className="mt-2 grid grid-cols-3 gap-2">
                        {[
                            {label: "All", value: ""},
                            {label: "Task", value: "task"},
                            {label: "Activity", value: "activity"},
                        ].map((option) => (
                            <button
                                key={option.label}
                                type="button"
                                onClick={() => handleSelectTaskType(option.value as "" | TaskCategoryType)}
                                className={`h-10 rounded-xl border text-[14px] font-bold transition ${
                                    draftFilter.taskType === option.value
                                        ? "border-[var(--color4)] bg-[var(--color4)]/15 text-[var(--color4)]"
                                        : "border-[var(--color3)]/15 bg-[var(--color2)] text-[var(--font)]/80 hover:border-[var(--color4)]/60"
                                }`}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                </div>

                {draftFilter.taskType !== "activity" && (
                    <div>
                        <div className="text-[13px] font-bold text-[var(--color3)]">Group</div>
                        <div className="mt-2 grid grid-cols-3 gap-2">
                            {[
                                {label: "All", value: ""},
                                {label: "Study", value: "study"},
                                {label: "Work", value: "work"},
                            ].map((option) => (
                                <button
                                    key={option.label}
                                    type="button"
                                    onClick={() => handleSelectTaskGroup(option.value as "" | TaskGroup)}
                                    className={`h-10 rounded-xl border text-[14px] font-bold transition ${
                                        draftFilter.taskGroup === option.value
                                            ? "border-[var(--color4)] bg-[var(--color4)]/15 text-[var(--color4)]"
                                            : "border-[var(--color3)]/15 bg-[var(--color2)] text-[var(--font)]/80 hover:border-[var(--color4)]/60"
                                    }`}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <label className="block">
                    <span className="text-[13px] font-bold text-[var(--color3)]">Category</span>
                    <select
                        value={draftFilter.categoryId}
                        onChange={(event) => updateFilter({categoryId: event.target.value})}
                        className="mt-2 h-11 w-full rounded-xl border border-[var(--color3)]/15 bg-[var(--color2)] px-3 text-[14px] font-bold text-[var(--font)] outline-none transition focus:border-[var(--color4)]"
                    >
                        <option value="">All categories</option>
                        {filteredCategories.map((category) => (
                            <option key={category.id} value={category.id}>
                                {category.title}
                            </option>
                        ))}
                    </select>
                </label>

                <div className="grid grid-cols-2 gap-3">
                    <label className="block">
                        <span className="text-[13px] font-bold text-[var(--color3)]">From date</span>
                        <input
                            type="date"
                            value={draftFilter.dateFrom}
                            onChange={(event) => updateFilter({dateFrom: event.target.value})}
                            className="mt-2 h-11 w-full rounded-xl border border-[var(--color3)]/15 bg-[var(--color2)] px-3 text-[14px] font-bold text-[var(--font)] outline-none transition focus:border-[var(--color4)]"
                        />
                    </label>

                    <label className="block">
                        <span className="text-[13px] font-bold text-[var(--color3)]">To date</span>
                        <input
                            type="date"
                            value={draftFilter.dateTo}
                            onChange={(event) => updateFilter({dateTo: event.target.value})}
                            className="mt-2 h-11 w-full rounded-xl border border-[var(--color3)]/15 bg-[var(--color2)] px-3 text-[14px] font-bold text-[var(--font)] outline-none transition focus:border-[var(--color4)]"
                        />
                    </label>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <label className="block">
                        <span className="text-[13px] font-bold text-[var(--color3)]">Start after</span>
                        <input
                            type="time"
                            value={draftFilter.timeFrom}
                            onChange={(event) => updateFilter({timeFrom: event.target.value})}
                            className="mt-2 h-11 w-full rounded-xl border border-[var(--color3)]/15 bg-[var(--color2)] px-3 text-[14px] font-bold text-[var(--font)] outline-none transition focus:border-[var(--color4)]"
                        />
                    </label>

                    <label className="block">
                        <span className="text-[13px] font-bold text-[var(--color3)]">End before</span>
                        <input
                            type="time"
                            value={draftFilter.timeTo}
                            onChange={(event) => updateFilter({timeTo: event.target.value})}
                            className="mt-2 h-11 w-full rounded-xl border border-[var(--color3)]/15 bg-[var(--color2)] px-3 text-[14px] font-bold text-[var(--font)] outline-none transition focus:border-[var(--color4)]"
                        />
                    </label>
                </div>
            </div>

            <div className="mt-5 flex items-center justify-end gap-2">
                <button
                    type="button"
                    onClick={handleClear}
                    className="h-10 rounded-xl border border-[var(--color3)]/20 bg-transparent px-4 text-[14px] font-bold text-[var(--color3)] transition hover:border-[var(--color4)] hover:text-[var(--font)]"
                >
                    Clear
                </button>
                <button
                    type="button"
                    onClick={() => onApply(draftFilter)}
                    className="h-10 rounded-xl bg-[var(--color4)] px-5 text-[14px] font-bold text-[var(--font)] transition hover:brightness-110"
                >
                    Apply
                </button>
            </div>
        </div>
    );
}
