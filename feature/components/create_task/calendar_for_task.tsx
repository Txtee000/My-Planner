"use client"

import { useEffect, useMemo, useState } from "react";



type CalendarForTaskProps = {
    value?: TaskDeadlineValue;
    onChange?: (value: TaskDeadlineValue) => void;
};

const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
];

const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function startOfDay(date: Date){
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function isSameDate(a: Date, b: Date){
    return (
        a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate()
    );
}

function formatDateLabel(date: Date){
    return new Intl.DateTimeFormat("en", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
    }).format(date);
}

export function CalendarForTask({ value, onChange }: CalendarForTaskProps){
    const today = startOfDay(new Date());
    const [selectedDate, setSelectedDate] = useState(value?.date ?? today);
    const [viewDate, setViewDate] = useState(new Date((value?.date ?? today).getFullYear(), (value?.date ?? today).getMonth(), 1));
    const [isAllDay, setIsAllDay] = useState(value?.isAllDay ?? true);
    const [selectedTime, setSelectedTime] = useState(value?.time ?? "00:00");


    const calendarDays = useMemo(() => {
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();
        const firstDayOfMonth = new Date(year, month, 1);
        const startDay = firstDayOfMonth.getDay();
        const lastDateOfMonth = new Date(year, month + 1, 0).getDate();
        const lastDateOfPrevMonth = new Date(year, month, 0).getDate();
        const days: Array<{
            date: Date;
            isCurrentMonth: boolean;
        }> = [];

        for(let index = startDay - 1; index >= 0; index--){
            days.push({
                date: new Date(year, month - 1, lastDateOfPrevMonth - index),
                isCurrentMonth: false,
            });
        }

        for(let day = 1; day <= lastDateOfMonth; day++){
            days.push({
                date: new Date(year, month, day),
                isCurrentMonth: true,
            });
        }

        const remainingDays = 42 - days.length;
        for(let day = 1; day <= remainingDays; day++){
            days.push({
                date: new Date(year, month + 1, day),
                isCurrentMonth: false,
            });
        }

        return days;
    }, [viewDate]);

    function emitChange(nextDate = selectedDate, nextIsAllDay = isAllDay, nextTime = selectedTime){
        onChange?.({
            date: nextDate,
            isAllDay: nextIsAllDay,
            time: nextTime,
        });
    }

    function goPrevMonth(){
        setViewDate((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1));
    }

    function goNextMonth(){
        setViewDate((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1));
    }

    function selectDate(date: Date){
        const nextDate = startOfDay(date);
        setSelectedDate(nextDate);
        setViewDate(new Date(nextDate.getFullYear(), nextDate.getMonth(), 1));
        emitChange(nextDate);
    }

    function selectToday(){
        selectDate(today);
    }

    

    function selectMode(nextIsAllDay: boolean){
        setIsAllDay(nextIsAllDay);
        emitChange(selectedDate, nextIsAllDay);
    }

    function selectTime(time: string){
        setSelectedTime(time);
        emitChange(selectedDate, false, time);
    }

    return(
        <div className="rounded-xl border border-[var(--color3)]/15 bg-[var(--color1)]/55 p-3">
            <div className="flex items-center gap-3">
                <span className="material-symbols-outlined !text-[24px] text-[var(--color4)]">
                    event
                </span>
                <div className="min-w-0 flex-1">
                    <div className="text-[13px] font-bold text-[var(--color3)]">Deadline</div>
                    <div className="truncate text-[15px] font-bold text-[var(--font)]">
                        {formatDateLabel(selectedDate)}
                        {!isAllDay && ` at ${selectedTime}`}
                    </div>
                </div>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2">
                <button
                    type="button"
                    onClick={() => selectMode(true)}
                    className={`
                        flex h-10 items-center justify-center gap-2 rounded-xl border text-[14px] font-bold transition
                        ${isAllDay
                            ? "border-[var(--color4)] bg-[var(--color4)]/10 text-[var(--color4)]"
                            : "border-[var(--color3)]/15 bg-[var(--color2)] text-[var(--color3)] hover:border-[var(--color4)] hover:text-[var(--font)]"
                        }
                    `}
                >
                    <span className="material-symbols-outlined !text-[19px]">wb_sunny</span>
                    All day
                </button>
                <button
                    type="button"
                    onClick={() => selectMode(false)}
                    className={`
                        flex h-10 items-center justify-center gap-2 rounded-xl border text-[14px] font-bold transition
                        ${!isAllDay
                            ? "border-[var(--color4)] bg-[var(--color4)]/10 text-[var(--color4)]"
                            : "border-[var(--color3)]/15 bg-[var(--color2)] text-[var(--color3)] hover:border-[var(--color4)] hover:text-[var(--font)]"
                        }
                    `}
                >
                    <span className="material-symbols-outlined !text-[19px]">schedule</span>
                    Due time
                </button>
            </div>

            <div className="mt-3 rounded-xl border border-[var(--color3)]/15 bg-[var(--color2)] p-3">
                <div className="mb-3 flex items-center justify-between">
                    <button
                        type="button"
                        onClick={goPrevMonth}
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-[var(--color3)] transition hover:bg-white/10 hover:text-[var(--font)]"
                        aria-label="Previous month"
                    >
                        <span className="material-symbols-outlined !text-[22px]">chevron_left</span>
                    </button>
                    <div className="text-center">
                        <div className="text-[16px] font-bold text-[var(--font)]">{monthNames[viewDate.getMonth()]}</div>
                        <div className="text-[12px] font-bold text-[var(--color3)]">{viewDate.getFullYear()}</div>
                    </div>
                    <button
                        type="button"
                        onClick={goNextMonth}
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-[var(--color3)] transition hover:bg-white/10 hover:text-[var(--font)]"
                        aria-label="Next month"
                    >
                        <span className="material-symbols-outlined !text-[22px]">chevron_right</span>
                    </button>
                </div>

                <div className="grid grid-cols-7 text-center text-[11px] font-bold text-[var(--color3)]/70">
                    {dayNames.map((day) => (
                        <div key={day} className="h-7">{day}</div>
                    ))}
                </div>

                <div className="grid grid-cols-7 gap-1">
                    {calendarDays.map((item) => {
                        const active = isSameDate(item.date, selectedDate);
                        const isToday = isSameDate(item.date, today);

                        return(
                            <button
                                key={item.date.getTime()}
                                type="button"
                                onClick={() => selectDate(item.date)}
                                className={`
                                    flex h-9 items-center justify-center rounded-lg border text-[13px] font-bold transition
                                    ${active
                                        ? "border-[var(--color4)] bg-[var(--color4)] text-[var(--color1)]"
                                        : "border-transparent hover:border-[var(--color4)]/60 hover:bg-white/10"
                                    }
                                    ${item.isCurrentMonth ? "text-[var(--font)]" : "text-[var(--color3)]/30"}
                                    ${isToday && !active ? "bg-[var(--color4)]/10 text-[var(--color4)]" : ""}
                                `}
                            >
                                {item.date.getDate()}
                            </button>
                        );
                    })}
                </div>

                <div className="mt-3">
                    <button
                        type="button"
                        onClick={selectToday}
                        className="h-9 w-full rounded-lg border border-[var(--color3)]/15 bg-[var(--color1)] text-[13px] font-bold text-[var(--color3)] transition hover:border-[var(--color4)] hover:text-[var(--font)]"
                    >
                        Today
                    </button>
                    
                </div>
            </div>

            {!isAllDay && (
                <label className="mt-3 flex items-center gap-3 rounded-xl border border-[var(--color3)]/15 bg-[var(--color2)] p-3">
                    <span className="material-symbols-outlined !text-[22px] text-[var(--color4)]">schedule</span>
                    <span className="text-[14px] font-bold text-[var(--color3)]">Time</span>
                    <input
                        type="time"
                        value={selectedTime}
                        onChange={(event) => selectTime(event.target.value)}
                        className="ml-auto h-10 rounded-lg border border-[var(--color3)]/15 bg-[var(--color1)] px-8 text-[15px] font-bold text-[var(--font)] outline-none transition focus:border-[var(--color4)]"
                    />
                </label>
            )}
        </div>
    );
}
