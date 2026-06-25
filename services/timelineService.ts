import Timelines from "@/app/(protected)/timelines_page/page";





export async function getTimeline_items() {

    const response = await fetch(`/api/timeline_items`,{
        method: "GET",
    })
    if(!response.ok){
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch timeline_item data");
    }

    const data = await response.json();

    const timeline_items = data.timelineItems;
    if(!timeline_items){
        return null;
    }

    return timeline_items;
    
}

export async function addTimeline_item(
    category_id,
    title,
    position,
    startTIme,
    endTime,
    startDate,
    endDate,
    
){

}