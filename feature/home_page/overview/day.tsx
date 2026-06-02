"use client"

import { useEffect, useRef, useState } from "react"; 

export function Day(){

    const timelineRef = useRef<HTMLDivElement | null>(null);
    const [sliderValue, setSliderValue] = useState(0);
    const [date, setDate] = useState<Date>(new Date());
    const [currentTimeLeft, setCurrentTimeLeft] = useState(0);

    // ขนาดความยาว timeline
    const hours = Array.from({ length: 24 }, (_, i) => i); 
    const hourWidth = 96;
    const timeLineWidth = 24 * hourWidth;
    
    

    

    useEffect(() => {
        setDate(new Date());
        setCurrentTimeLeft(getCurrentTimePosition(date));
    } , []);


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
        setDate(new Date()); // อัปเดตวันที่เป็นปัจจุบัน

        if (!timelineRef.current) return;

        timelineRef.current.scrollTo({
            left: currentTimeLeft - timelineRef.current.clientWidth / 2,
            behavior: "smooth",
        });
        
    }
    useEffect(() => {
        console.log("new: ", date);
    },[date]);

    function getCurrentTimePosition(date: Date) {
        const hour = date.getHours();
        const minute = date.getMinutes();
        const second = date.getSeconds();

        const totalHours = hour + minute / 60 + second / 3600;
        
        setCurrentTimeLeft(totalHours * hourWidth);
        return totalHours * hourWidth;
    }



    return(
       <div className="">

            <button onClick={onPressedCurrentButton} className="absolute  top-6 left-75">
                <div className="text-(--font) underline hover:text-gray-400">Current</div>
            </button>
            <div className="absolute bg-(--color4) top-5 right-12 text-(--color1) font-bold px-2 py-1 rounded-[6px]">
                {date.toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                })}
            </div>

            <div className="w-full overflow-x-auto" onScroll={handleScroll} ref={timelineRef}>
                
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
                                className="relative flex flex-col items-center"
                                style={{ width: `${hourWidth}px`}}
                            
                            >
                                <div className=" h-[90%] border-l border-white/20" />
                                <span className="text-xs font-bold text-white/80 mt-2">
                                    {String(hour).padStart(2,"0")}:00
                                </span>

                            </div>
                        ))}
                        <div 
                            className=" h-[90%] border-l border-(--color4) border-dashed absolute" 
                            style={{
                                left: `${currentTimeLeft+48}px`,
                            }} 
                        />
                        <div className=" border border-red absolute bottom-8 items-center w-full"  />
                    </div>
                </div>
            </div>

            {/* slider */}
            <div className="relative w-full h-[10px] bg-(--color1) rounded-4xl mt-6">
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