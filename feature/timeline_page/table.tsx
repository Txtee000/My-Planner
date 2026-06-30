"use client"

import { EditTimeline } from "@/feature/components/edit_timeline";
import { emptyTimelineFilter, TimelineFilter, type TimelineFilterValue } from "@/feature/timeline_page/timeline_filter";
import { getTaskCategories } from "@/services/taskCategoryService";
import { addTimeline_item, deleteTimeline_item, getTimeline_items } from "@/services/timelineService";
import { useCallback, useEffect, useState } from "react";


const THAI_SEARCH_CHAR_MAP: Record<string, string> = {
    "เเ": "แ",
};

function normalizeThaiSearchText(text: string){
    let normalizedText = text.normalize("NFC");

    for(const [from, to] of Object.entries(THAI_SEARCH_CHAR_MAP)){
        normalizedText = normalizedText.replaceAll(from, to);
    }

    return normalizedText.toLowerCase();
}


export function Table(){

    const [search, setSearch] = useState("");
    const[timelineItems, setTimelineItems] = useState<Timeline_item[]>([]);
    const [editingTimeline, setEditingTimeline] = useState<Timeline_item | null>(null);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [timelineFilter, setTimelineFilter] = useState<TimelineFilterValue>(emptyTimelineFilter);

    const hasActiveFilter = Object.values(timelineFilter).some(Boolean);

    const fetchData = useCallback(async () => {
        const filter = normalizeThaiSearchText(search);
        const data = await getTimeline_items({
            title: filter,
            taskType: timelineFilter.taskType || undefined,
            taskGroup: timelineFilter.taskGroup || undefined,
            categoryId: timelineFilter.categoryId || undefined,
            dateFrom: timelineFilter.dateFrom || undefined,
            dateTo: timelineFilter.dateTo || undefined,
            timeFrom: timelineFilter.timeFrom || undefined,
            timeTo: timelineFilter.timeTo || undefined,
        });

        setTimelineItems(Array.isArray(data) ? data : []);
    }, [search, timelineFilter]);


    useEffect(() => {
        const timeoutId = window.setTimeout(() => {
            void fetchData();
        }, 0);

        return () => window.clearTimeout(timeoutId);
    }, [fetchData])

    function formatDate(){
        const date = new Date();
        const str = date.toISOString().split('T')[0];

        return str;
    }

    async function addTimelineItem(){
        const date = formatDate();
        const categories = await getTaskCategories();
        if(!categories){
            alert("ขณะนี้ยังไม่มี categories ให้เลือก")
        }
        const category = categories[0]

        await addTimeline_item({
            category_id: category.id,
            title: "New Timmeline",
            startTime: "00:00",
            endTime: "01:00",
            startDate: date,
            endDate: date,
            description: null,
        })
        await fetchData();
    }   

    function applyTimelineFilter(filter: TimelineFilterValue){
        setTimelineFilter(filter);
        setIsFilterOpen(false);
    }

    function clearTimelineFilter(){
        setTimelineFilter(emptyTimelineFilter);
        setIsFilterOpen(false);
    }




    return(
       <div className="w-[1180px]">
            <div className="w-full flex items-center justify-between">
                <div className="text-white text-[32px] font-bold leading-none">Timeline Table</div>
                <div className="flex items-center">
                    {/* search bar */}
                    <div className="flex bg-[#343639] w-[500px] p-[8px] rounded-4xl shadow-[2px_3px_5px_rgba(255,255,255,0.3)]">
                        <input 
                            className=" w-full  text-gray-300 text-[18px]"
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
                    <div className="relative ">
                        <button
                            type="button"
                            onClick={() => setIsFilterOpen((currentValue) => !currentValue)}
                            className={`mx-2 ml-[16px] rounded-xl p-2 transition hover:bg-[#606061]/50 leading-none ${
                                hasActiveFilter ? "bg-[var(--color4)]/20 text-[var(--color4)]" : "text-(--font)"
                            }`}
                            aria-label="Open timeline filter"
                        >
                            <span className="material-symbols-outlined !text-[28px] ">
                                filter_alt
                            </span>
                        </button>

                        {isFilterOpen && (
                            <TimelineFilter
                                value={timelineFilter}
                                onApply={applyTimelineFilter}
                                onClear={clearTimelineFilter}
                                onClose={() => setIsFilterOpen(false)}
                            />
                        )}
                    </div>
                    {/* new timeline */}

                    {/* create timeline data */}
                    <button onClick={addTimelineItem} className="text-(--font) text-[18px] px-4 py-2 rounded-2xl hover:text-(--font) bg-(--color4) hover:bg-(--color4)/60">
                        + New
                    </button>



                </div>
            </div>
            <div className="w-full border-b-2 border-white mt-4"></div>

            
           

            {/* timeline data */}
            <table className="w-full">
                <thead>
                    <tr className="text-left border-b-2 border-(--color2)">
                        <th className="text-(--font) text-[24px] py-4 w-[220px] max-w-[220px]">Name</th>
                        <th className="text-(--font) text-[24px] py-4 w-[192px] max-w-[192px]">Start</th>
                        <th className="text-(--font) text-[24px] py-4 w-[192px] max-w-[192px]">End</th>
                        <th className="text-(--font) text-[24px] py-4 w-[192px] max-w-[192px]">Type</th>
                        <th className="text-(--font) text-[24px] py-4 w-[320px] max-w-[320px]">Comment</th>
                        <th className="text-(--font) text-[24px] w-[24px] max-w-[24px] py-4"></th>
                    </tr>
                </thead>
                
                
                
                <tbody>
                 
                
                
                {timelineItems.map((item) => {
                    


                    const category = item.task_categories;
                    const taskType: TaskCategoryType = category.task_type;
                    const taskGroup: TaskGroup | null = category.task_group;
                    const taskCategory = category.title;

                    function handleEdit(){
                        setEditingTimeline(item);
                    }


                    async function handleDelete(e: React.MouseEvent){
                        e.stopPropagation();
                        await deleteTimeline_item(item.id);
                        await fetchData();
                    }

                    return(
                        <tr key={item.id} className="relative border-b-2 border-(--color2) cursor-pointer shadow 
                            transition-all duration-100 ease-in-out
                            hover:scale-[1.01] 
                            hover:-translate-y-1 
                            hover:translate-x-1"
                            onClick={handleEdit}
                        >
                            <td className="text-[16px] text-(--font) py-4 mr-4 w-[160px] break-all">
                                <div className=" pr-2">
                                    {item.title}
                                </div>
                            </td>
                            <td className="text-[16px] text-(--font) py-4 mr-4 w-[140px] overflow-auto">{item.start_date} <br/> {item.start_time}</td>
                            <td className="text-[16px] text-(--font) py-4 mr-4 w-[140px] overflow-auto">{item.end_date} <br/> {item.end_time}</td>
                            <td className="text-[16px] text-(--font) py-4 mr-4 w-[140px]"> 
                                <div className="flex w-full flex-wrap gap-2">
                                    <div className="px-[8px] px-[2px] min-w-[80px] rounded-xl bg-gray-500 text-center">
                                        {taskType}
                                    </div>
                                    {taskType == "task" && (
                                        <div className="px-[8px] px-[2px] min-w-[80px] rounded-xl bg-gray-500 text-center">
                                            {taskGroup} 
                                        </div>
                                    )}
                                    <div className="px-[8px] px-[2px] min-w-[80px] rounded-xl text-center" style={{backgroundColor: category.color_hex}}>
                                        {taskCategory}
                                    </div>
                                </div>
                            </td>
                            <td className="text-[16px] text-(--font) py-4  mr-4 w-[240px]  break-all">
                                <div className="max-h-[90px] overflow-auto">
                                    {item.description}
                                </div>
                                
                            </td>
                            <td className="w-[40px] py-4 text-center">
                                <button 
                                    onClick={handleDelete}
                                    className="flex items-center justify-center p-2 rounded-full hover:bg-red-500/10 transition-colors"
                                >
                                    <span className="material-symbols-outlined text-[#D94545]">
                                    delete
                                    </span>
                                </button>
                            </td>
                            
                        </tr>
                    );
                })}
                </tbody>
                

            </table>
            

            {editingTimeline && (
                <EditTimeline
                    item={editingTimeline}
                    onClose={() => setEditingTimeline(null)}
                    onUpdated={fetchData}
                />
            )}

       </div>

    );
}
