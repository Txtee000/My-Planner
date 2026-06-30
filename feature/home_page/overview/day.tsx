"use client"

import { useEffect, useRef, useState } from "react"; 
import { Calendar_day } from "./component/calendar";
import { getTimeline_items } from "@/services/timelineService";
import { EditTimeline } from "@/feature/components/edit_timeline";
import { useTasksQuery } from "@/hooks/task_items/useTasksQuery";

export function OverviewDay(){

    const timelineRef = useRef<HTMLDivElement | null>(null);
    const [sliderValue, setSliderValue] = useState(0);
    const [date, setDate] = useState<Date>(new Date());
    const [currentTimeLeft, setCurrentTimeLeft] = useState(0); // ตำแหน่งของเส้นเวลาปัจจุบัน (หน่วยเป็นพิกเซล)

    const [timelines, setTimeline] = useState<Timeline_item[]>([]);

    // ขนาดความยาว timeline
    const hours = Array.from({ length: 24 }, (_, i) => i); 
    const hourWidth = 96;
    const timelinePaddingLeft = 72;
    const timeLineWidth = 24 * hourWidth + timelinePaddingLeft;
    

    const [selectedDate, setSelectedDate] = useState(new Date());
    const [editingTimeline,setEditingTimeline] = useState<Timeline_item | null>(null);
    

    const { data: tasksData } = useTasksQuery({
        deadline_date: date.toString()
    });

    const tasks = Array.isArray(tasksData) ? tasksData : [];
    

    

    useEffect(() => {
        onPressedCurrentButton();
        fetchTimelines();
        
        
    } , []);

    
    async function fetchTimelines() {
        const timelines = await getTimeline_items();
        setTimeline(timelines);
        
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
        await fetchTimelines();
        
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

    function getTimelineDurationWidth(item: Timeline_item, currentDate: Date){
        // แปลงวันที่ของ item และวันที่เปิดดูให้อยู่ในรูปแบบ YYYY-MM-DD เพื่อเช็คประเภทวัน
        const formatYMD = (d: Date) => d.toISOString().split('T')[0];
        
        // "YYYY-MM-DD"
        const viewDateStr = formatYMD(currentDate);
        const startStr = item.start_date; 
        const endStr = item.end_date;     

        // เช็คก่อนว่าไอเทมนี้อยู่ในช่วงวันที่เปิดดูไหม ถ้าไม่อยู่ไม่ต้องวาด
        if (viewDateStr < startStr || viewDateStr > endStr) {
            return { shouldRender: false, left: 0, width: 0 };
        }

        // แปลงเวลาเริ่มต้น/สิ้นสุดเป็นทศนิยมชั่วโมง (เช่น "01:30" -> 1.5)
        const timeToHours = (tStr: string) => {
            if (!tStr) return 0;
            const [h, m] = tStr.split(":").map(Number);
            return h + (m / 60);
        };

        let startHour = 0;
        let endHour = 24; // ค่าเริ่มต้นให้เต็มวันไว้ก่อน

        const isStartDay = viewDateStr === startStr;
        const isEndDay = viewDateStr === endStr;

        if (isStartDay && isEndDay) {
            // กรณีวันเดียวกัน (จบในวัน)
            startHour = timeToHours(item.start_time);
            endHour = timeToHours(item.end_time);
        } else if (isStartDay) {
            // วันแรกของทาสก์ข้ามวัน -> เริ่มตามเวลาทาสก์ จบสิ้นวัน (24:00)
            startHour = timeToHours(item.start_time);
            endHour = 24;
        } else if (isEndDay) {
            // วันสุดท้ายของทาสก์ข้ามวัน -> เริ่มต้นวัน (00:00) จบตามเวลาทาสก์
            startHour = 0;
            endHour = timeToHours(item.end_time);
        } else {
            // วันตรงกลางของทาสก์ข้ามวัน -> แสดงเต็มวัน
            startHour = 0;
            endHour = 24;
        }
        // คำนวณเป็นพิกเซล
        const leftPx = startHour * hourWidth;
        const widthPx = (endHour - startHour) * hourWidth;

        return {
            shouldRender: true,
            left: leftPx,
            width: widthPx
        };

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
                        {timelines.map((item, index) => {
                            // เรียกใช้ฟังก์ชันที่คุณเขียนไว้ โดยส่งไอเทมและ state วันที่เปิดดู (date) เข้าไป
                            const metrics = getTimelineDurationWidth(item, date);
                            if (!metrics || !metrics.shouldRender) return null;


                            function handleEditTimeline(){
                                setEditingTimeline(item);
                            }

                            return (
                                <button
                                    key={item.id || index}
                                    onClick={handleEditTimeline}
                                    className="absolute h-[36px] rounded-lg text-white text-xs px-3 flex items-center shadow-md overflow-hidden whitespace-nowrap border border-white/10 select-none transition-all hover:brightness-110"
                                    style={{
                                        // อย่าลืมบวกด้วย timelinePaddingLeft เพื่อให้ตำแหน่งซิงค์กับแนวเส้นชั่วโมง
                                        left: `${metrics.left + timelinePaddingLeft}px`,
                                        width: `${metrics.width}px`,
                                        // ดึงสีตามประเภทงานมาแสดง (ถ้ามีฟิลด์สีแบบโค้ดก่อนหน้า) หรือใช้สีสำรอง
                                        backgroundColor: item.task_categories?.color_hex || '#4B5563', 
                                        // 💡 กำหนดระยะห่างจากขอบบน เพื่อไม่ให้ไปทับกับ Task Deadline ข้างบน
                                        top: `${index * 40}px`
                                    }}
                                    // แสดงรายละเอียดเวลาเมื่อเอาเมาส์ไปชี้ (Tooltip)
                                    title={`${item.title} (${item.start_date} ${item.start_time} - ${item.end_date} ${item.end_time})`}
                                >
                                    {/* แสดงชื่อของ Timeline */}
                                    <span className="font-semibold truncate">{item.title}</span>
                                </button>
                            );
                        })}
                        {editingTimeline && (
                            <EditTimeline
                                item={editingTimeline}
                                onClose={() => setEditingTimeline(null)}
                                onUpdated={fetchTimelines}
                            />
                        )}

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