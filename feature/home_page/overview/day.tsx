"use client"

import { useEffect, useRef, useState } from "react"; 
import { Calendar_day } from "./component/calendar";
import { getTasks } from "@/services/taskService";

export function OverviewDay(){

    const timelineRef = useRef<HTMLDivElement | null>(null);
    const [sliderValue, setSliderValue] = useState(0);
    const [date, setDate] = useState<Date>(new Date());
    const [currentTimeLeft, setCurrentTimeLeft] = useState(0); // ตำแหน่งของเส้นเวลาปัจจุบัน (หน่วยเป็นพิกเซล)

    const [tasks, setTasks] = useState<Task[]>([]);

    // ขนาดความยาว timeline
    const hours = Array.from({ length: 24 }, (_, i) => i); 
    const hourWidth = 96;
    const timelinePaddingLeft = 72;
    const timeLineWidth = 24 * hourWidth + timelinePaddingLeft;
    

    const [selectedDate, setSelectedDate] = useState(new Date());

    
    

    

    useEffect(() => {
        onPressedCurrentButton();
        fetchData();
        
        
    } , []);

    async function fetchData(){
        const strDate = date.toString();
        const data = await getTasks({deadline_date: strDate})
        setTasks(data);
    }


    // ตอนเลื่อน scroll
    function handleScroll(){
        if(!timelineRef.current) return;

        const scrollLeft = timelineRef.current.scrollLeft; // เลื่อนไปเท่าไหร่แล้ว
        const maxScroll = timelineRef.current.scrollWidth - timelineRef.current.clientWidth; // เลื่อนไปได้สูงสุดเท่าไหร่
        

        const percent = maxScroll === 0 ? 0 : (scrollLeft / maxScroll) * 100; // คำนวณเป็นเปอร์เซ็นต์

        setSliderValue(percent);
    }
    // ลาก slider 
    function handleSliderChange(value:number){
        setSliderValue(value);

        if(!timelineRef.current) return;
        const maxScroll = timelineRef.current.scrollWidth - timelineRef.current.clientWidth;

        timelineRef.current.scrollLeft = (value / 100) * maxScroll;
    }

    
    // current time button
    async function onPressedCurrentButton(){
        const now = new Date();
        setDate(now); // อัปเดตวันที่เป็นปัจจุบัน
        setCurrentTimeLeft(getCurrentTimePosition(now));
        contactCurrentLine(now)
        await fetchData();
        
    }
    // เลื่อนหน้าจอไปหาเส้นระบุเวลา
    function contactCurrentLine(date: Date){
        const pos = getCurrentTimePosition(date);

        if (!timelineRef.current) return;

        timelineRef.current.scrollTo({
            left: pos - timelineRef.current.clientWidth / 2,
        });
    }
    useEffect(() => {
        const now = new Date();
        if (isSameDate(date, now)) {
            setCurrentTimeLeft(getCurrentTimePosition(now));
            contactCurrentLine(now)
        } else {
            setCurrentTimeLeft(getCurrentTimePosition(date));
            contactCurrentLine(date)
        }

        
    }, [date]);
    function isSameDate(a: Date, b: Date) {
        return (
            a.getFullYear() === b.getFullYear() &&
            a.getMonth() === b.getMonth() &&
            a.getDate() === b.getDate()
        );
    }
    

    function getCurrentTimePosition(date: Date) {
        const hour = date.getHours();
        const minute = date.getMinutes();
        const second = date.getSeconds();

        const totalHours = hour + minute / 60 + second / 3600;
        
        return totalHours * hourWidth;
    }
    function getTaskPosition(timeStr: string){
        if (!timeStr) return 0;
        const [hour, minute, second] = timeStr.split(":").map(Number);

        const totalHours = hour + minute / 60 + second / 3600;
        
        return totalHours * hourWidth;
    }
    



    return(
       <div className="">

            <button onClick={onPressedCurrentButton} className="absolute  top-6 left-75">
                <div className="text-(--font) underline hover:text-gray-400">Current</div>
            </button>

            {/* date */}
            <div className="absolute w-[160px] flex justify-center bg-(--color4) top-5 left-[830px] text-(--color1) font-bold px-2 py-1 rounded-[6px]">
                {date.toLocaleDateString("en-US", {
                    weekday: "short",
                })}
                {", "}
                {date.toLocaleDateString("en-US", {
                    day: "numeric",
                })}
                {" "}
                {date.toLocaleDateString("en-US", {
                    
                    month: "short",
                    year: "numeric",
                }).replace(/,/g, "")}
            </div>
            <Calendar_day
                setDate={setDate}
                selectedDate={selectedDate}
                onChangeDate={setSelectedDate}
            />

            <div className="w-full overflow-x-auto pb-8 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]" onScroll={handleScroll} ref={timelineRef}>
                
                {/* timeline */}
                <div 
                    className="relative h-[320px] mt-8" 
                    style={{width: `${timeLineWidth}px`}}
                >
                    {/* vertical hour lines */}
                    <div className="absolute inset-0 flex">
                        {hours.map((hour) => (
                            <div
                                key={hour}
                                className="relative flex flex-col items-center left-[24px]"
                                style={{ width: `${hourWidth}px`}}
                            
                            >
                                <div className=" h-[90%] border-l border-white/20" />
                                <span className="text-xs font-bold text-white/80 mt-2">
                                    {String(hour).padStart(2,"0")}:00
                                </span>

                            </div>
                        ))}
                        {/* task deadline */}
                        {tasks.map((task, index) => {
                            
                            if(!task.deadline_time){
                                return
                            }
                            ;
                            const taskLeft = getTaskPosition(task.deadline_time);
                            if(!taskLeft) return;
                            
                            return (
                                <div
                                    key={index}
                                    className="absolute h-[10%] border-l-3  border-[#CC2748] rounded-4xl"
                                    style={{
                                        left: `${taskLeft + timelinePaddingLeft}px`,
                                    }}
                                >
                                    <span className="absolute -top-5 left-1 bg-[#CC2748] text-white text-[10px] px-1 rounded whitespace-nowrap max-w-[100px] overflow-auto">
                                        {task.title} ({task.deadline_time.substring(0, 5)})
                                    </span>

                                </div>
                            );
                        })}

                        {/* current vertical line */}
                        <div 
                            className=" h-[90%] border-l border-(--color4) border-dashed absolute" 
                            style={{
                                left: `${currentTimeLeft+timelinePaddingLeft}px`, 
                            }} 
                        />
                        <div className=" border border-red absolute bottom-8 items-center w-full"  />
                    </div>
                </div>
            </div>

            {/* slider */}
            <div className="relative w-full h-[10px] bg-(--color1) rounded-4xl">
                <input
                    type="range"
                    min={0}
                    max={100}
                    value={sliderValue}
                    onChange={(e) => handleSliderChange(Number(e.target.value))}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" // 
                />
                
                <div
                    className="absolute top-0 h-full w-[55px] bg-(--color4) rounded-4xl flex justify-end items-center pointer-events-none"
                    style={{
                        left: `${sliderValue}%`,
                        transform: `translateX(-${sliderValue}%)`,
                    }}
                >
                    <div className="w-2 h-2 bg-white rounded-full mr-[2px]" />
                </div>
            </div>


            
        
       </div>
    );



}