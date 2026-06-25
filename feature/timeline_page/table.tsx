"use client"

import { useEffect, useState } from "react";





const mockTimelines: Timeline_item[] = [
    {
        id: "timeline-001",
        user_id: "user-001",
        category_id: "category-study",
        title: "Final Exam Preparation",
        position: 1000,
        startDate: "2026-06-24",
        endDate: "2026-07-05",
        startTime: "09:00",
        endTime: "18:00",
        created_at: "2026-06-20T10:00:00.000Z",
        updated_at: "2026-06-24T08:30:00.000Z",
        description: "Study plan for math, physics, and programming.",
    },
    {
        id: "timeline-002",
        user_id: "user-001",
        category_id: "category-work",
        title: "Portfolio Website",
        position: 2000,
        startDate: "2026-07-01",
        endDate: "2026-07-20",
        startTime: "10:00",
        endTime: "16:00",
        created_at: "2026-06-21T13:15:00.000Z",
        updated_at: "2026-06-21T13:15:00.000Z",
        description: "Design, build, test, and deploy personal portfolio.",
    },
    {
        id: "timeline-003",
        user_id: "user-001",
        category_id: "category-application",
        title: "Internship Application",
        position: 3000,
        startDate: "2026-06-10",
        endDate: "2026-06-18",
        startTime: "13:00",
        endTime: "17:00",
        created_at: "2026-06-08T09:00:00.000Z",
        updated_at: "2026-06-18T11:45:00.000Z",
        description: null,
    },
];






export function Table(){

    const [search, setSearch] = useState("");

    const [name, setName] = useState("New Timmeline");
    const [date, setDate] = useState(new Date());
    const [time, setTIme] = useState("00:00-01:00");
    const [taskType, setTaskType] = useState<TaskCategoryType>("task");
    const [taskGroup, setTaskGroup] = useState<TaskGroup>("study");
    const [taskCategory, setTaskCategory] = useState("");
    const [timelines, setTimelines] = useState("")

    const[timelineItmes, setTimelineItems] = useState<Timeline_item[]>([]);


    useEffect(() => {
        fetchData();
    }, [])

    function fetchData(){
        setTimelineItems(mockTimelines);
    }

    function addTimelineItem(){
        const 
    }



    return(
       <div className="w-[1180px]">
            <div className="w-full flex items-center justify-between">
                <div className="text-white text-[32px] font-bold leading-none">Timeline Table</div>
                <div className="flex items-center">
                    {/* search bar */}
                    <div className="flex bg-[#343639] w-[500px] p-[8px] rounded-4xl shadow-[2px_3px_5px_rgba(255,255,255,0.3)]">
                        <input 
                            className="ml-2 w-full  text-gray-300 text-[18px]"
                            type="text"
                            value={search}
                            placeholder="Type to seach..."
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <span className="mx-2 pt-[2px] material-symbols-outlined text-(--font) ">
                            search
                        </span>
                    </div>

                    {/* filter */}
                    <span className="material-symbols-outlined text-(--font) !text-[28px] ml-[16px] p-2 rounded-xl hover:bg-[#606061]/50 " >
                        filter_alt
                    </span>

                </div>
            </div>
            <div className="w-full border-b-2 border-white mt-4"></div>


            {/* timeline data */}
            <table className="w-full">
                <thead>
                    <tr className="text-left border-b-2 border-(--color2)">
                        <th className="text-(--font) text-[24px] py-4">Name</th>
                        <th className="text-(--font) text-[24px] py-4">Start</th>
                        <th className="text-(--font) text-[24px] py-4">End</th>
                        <th className="text-(--font) text-[24px] py-4">Type</th>
                        <th className="text-(--font) text-[24px] py-4">Comment</th>
                    </tr>
                </thead>
                
                
                <tbody>

                </tbody>
                {timelineItmes.map((item) => {
                    return(
                        <tr key={item.id} className="border-b-2 border-(--color2)">
                            <td className="text-[20px] text-(--font) py-4 mr-4 w-[240px] break-all">{item.title}</td>
                            <td className="text-[20px] text-(--font) py-4 mr-4 w-[160px] overflow-auto">{item.startDate} <br/> {item.startTime}</td>
                            <td className="text-[20px] text-(--font) py-4 mr-4 w-[160px] overflow-auto">{item.endDate} <br/> {item.endTime}</td>
                            <td className="text-[20px] text-(--font) py-4 mr-4 w-[200px] overflow-auto"></td>
                            <td className="text-[20px] text-(--font) py-4 mr-4 w-[240px]  break-all">{item.description}</td>
                        </tr>
                    );
                })}
                

            </table>
            {/* create timeline data */}
            <button onClick={addTimelineItem} className="text-(--font)/50 text-[20px]  p-4 hover:text-(--font)">
                + New Timeline
            </button>

       </div>

    );
}