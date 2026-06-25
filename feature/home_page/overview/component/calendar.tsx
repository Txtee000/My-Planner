"use client";

import { useMemo, useState } from "react";

type CalendarPickerProps = {
  selectedDate: Date;
  onChangeDate: (date: Date) => void;
  setDate: (date: Date) => void;
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

export function Calendar_day({
  selectedDate,
  onChangeDate,
  setDate,
}: CalendarPickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const [viewDate, setViewDate] = useState(
    new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1)
  );

  const calendarDays = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const startDay = firstDayOfMonth.getDay();

    const lastDateOfMonth = new Date(year, month + 1, 0).getDate();
    const lastDateOfPrevMonth = new Date(year, month, 0).getDate();

    const days: {
      date: Date;
      isCurrentMonth: boolean;
    }[] = [];

    // วันจากเดือนก่อนหน้า
    for (let i = startDay - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, lastDateOfPrevMonth - i),
        isCurrentMonth: false,
      });
    }

    // วันของเดือนปัจจุบัน
    for (let day = 1; day <= lastDateOfMonth; day++) {
      days.push({
        date: new Date(year, month, day),
        isCurrentMonth: true,
      });
    }

    // เติมวันเดือนถัดไปให้ครบ 42 ช่อง
    const remainingDays = 42 - days.length;

    for (let day = 1; day <= remainingDays; day++) {
      days.push({
        date: new Date(year, month + 1, day),
        isCurrentMonth: false,
      });
    }

    return days;
  }, [viewDate]);

  function isSameDate(a: Date, b: Date) {
    return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    );
  }

  function goPrevMonth() {
    setViewDate((prev) => {
      return new Date(prev.getFullYear(), prev.getMonth() - 1, 1);
    });
  }

  function goNextMonth() {
    setViewDate((prev) => {
      return new Date(prev.getFullYear(), prev.getMonth() + 1, 1);
    });
  }

  function selectDate(date: Date) {
    onChangeDate(date);
    setViewDate(new Date(date.getFullYear(), date.getMonth(), date.getDate()));
    setIsOpen(false);
    setDate(date);
  }

  return (
    <div className="absolute top-3 right-10">
      {/* ปุ่ม Icon Calendar */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex size-12 items-center justify-center rounded-xl text-white hover:bg-white/10"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="size-8"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8 7V3m8 4V3M4 11h16M5 5h14a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V6a1 1 0 011-1z"
          />
        </svg>
      </button>

      {/* Calendar Popup */}
      {isOpen && (
        <div className="absolute right-0 top-14 z-40 h-[440px] w-[320px] rounded-[28px] border border-white/50 bg-[#393E46] p-5 text-white shadow-2xl">
          {/* Header */}
          <div className="mb-5 flex items-center justify-between">
            <button
              type="button"
              onClick={goPrevMonth}
              className="flex size-9 items-center justify-center rounded-full bg-white/10 text-xl hover:bg-white/20"
            >
              ‹
            </button>

            <div className="text-center">
              <div className="text-lg font-bold">
                {monthNames[viewDate.getMonth()]}
              </div>
              <div className="text-sm text-white/60">
                {viewDate.getFullYear()}
              </div>
            </div>

            <button
              type="button"
              onClick={goNextMonth}
              className="flex size-9 items-center justify-center rounded-full bg-white/10 text-xl hover:bg-white/20"
            >
              ›
            </button>
          </div>

          {/* Day names */}
          <div className="mb-2 grid grid-cols-7 text-center text-xs font-bold text-white/50">
            {dayNames.map((day) => (
              <div key={day}>{day}</div>
            ))}
          </div>

          {/* Days */}
          <div className="grid grid-cols-7 gap-y-2 text-center">
            {calendarDays.map((item) => {
              const active = isSameDate(item.date, selectedDate);

              return (
                <button
                  key={item.date.toISOString()}
                  type="button"
                  onClick={() => selectDate(item.date)}
                  className={`
                    mx-auto flex size-9 items-center justify-center rounded-full text-sm font-bold transition
                    ${
                      active
                        ? "bg-[#10B6C2] text-[#222831]"
                        : "hover:bg-white/10"
                    }
                    ${
                      item.isCurrentMonth
                        ? "text-white"
                        : "text-white/25"
                    }
                  `}
                >
                  {item.date.getDate()}
                </button>
              );
            })}
          </div>

          {/* Footer */}
          <div className="mt-4 flex justify-center">
            <button
              type="button"
              onClick={() => selectDate(new Date())}
              className="rounded-xl bg-[#10B6C2] px-5 py-2 text-sm font-bold text-[#222831] hover:opacity-90"
            >
              Today
            </button>
          </div>
        </div>
      )}
    </div>
  );
}