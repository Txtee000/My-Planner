import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

type TaskType = "task" | "activity";
type TaskGroup = "study" | "work";

function isValidTaskType(value: string): value is TaskType {
    return value === "task" || value === "activity";
}

function isValidTaskGroup(value: string): value is TaskGroup {
    return value === "study" || value === "work";
}

function isDateKey(value: string){
    return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function isTimeKey(value: string){
    return /^\d{2}:\d{2}$/.test(value);
}


export async function GET(request: Request){
    const supabase = await createClient();
    const {data: user, error,} = await supabase.auth.getUser();


    if(error || !user){
        return NextResponse.json({user: null}, {status: 401});
    }

    const { searchParams } = new URL(request.url);
    const title = searchParams.get("query");
    const taskType = searchParams.get("task_type");
    const taskGroup = searchParams.get("task_group");
    const categoryId = searchParams.get("category_id");
    const dateFrom = searchParams.get("date_from");
    const dateTo = searchParams.get("date_to");
    const timeFrom = searchParams.get("time_from");
    const timeTo = searchParams.get("time_to");

    if(taskType && !isValidTaskType(taskType)){
        return NextResponse.json({ message: "Invalid task type" }, { status: 400 });
    }

    if(taskGroup && !isValidTaskGroup(taskGroup)){
        return NextResponse.json({ message: "Invalid task group" }, { status: 400 });
    }

    if(taskType === "activity" && taskGroup){
        return NextResponse.json(
            { message: "Activity category cannot have task group" },
            { status: 400 }
        );
    }

    if(dateFrom && !isDateKey(dateFrom)){
        return NextResponse.json({ message: "Invalid date_from" }, { status: 400 });
    }

    if(dateTo && !isDateKey(dateTo)){
        return NextResponse.json({ message: "Invalid date_to" }, { status: 400 });
    }

    if(timeFrom && !isTimeKey(timeFrom)){
        return NextResponse.json({ message: "Invalid time_from" }, { status: 400 });
    }

    if(timeTo && !isTimeKey(timeTo)){
        return NextResponse.json({ message: "Invalid time_to" }, { status: 400 });
    }


    let query = supabase
        .from("timeline_items")
        .select(`
            *,
            task_categories!inner (id, title, task_type, color_hex, task_group )
            
        `)
        .eq("user_id", user.user.id)


    if(title){
        query = query.ilike("title", `%${title}%`);
    }

    if(taskType){
        query = query.eq("task_categories.task_type", taskType);
    }

    if(taskGroup){
        query = query.eq("task_categories.task_group", taskGroup);
    }

    if(categoryId){
        query = query.eq("category_id", categoryId);
    }

    if(dateFrom){
        query = query.gte("end_date", dateFrom);
    }

    if(dateTo){
        query = query.lte("start_date", dateTo);
    }

    if(timeFrom){
        query = query.gte("start_time", timeFrom);
    }

    if(timeTo){
        query = query.lte("end_time", timeTo);
    }



    const { data: timelineItems, error: timelineItemsError } = await query;

    if(timelineItemsError){
        return NextResponse.json({ message: timelineItemsError.message }, { status: 400 });
    }

    return NextResponse.json({ timelineItems }, { status: 200 });

}

export async function POST(request: Request){
    const supabase = await createClient();
    const {data: user, error: userError,} = await supabase.auth.getUser();

    if(userError || !user){
        return NextResponse.json({user: null}, {status: 401});
    }


    const {
        category_id,
        title,
        startTime,
        endTime,
        startDate,
        endDate,
        description,

    } = await request.json();



    const payload = {
        user_id: user.user.id,
        category_id: category_id,
        title: title.trim(),
        start_date: startDate,
        end_date: endDate,
        start_time: startTime,
        end_time: endTime,
        description,
    }

    const {data, error} = await supabase
        .from("timeline_items")
        .insert(payload)
        .select("*")
        .single();

    if(error){
        return NextResponse.json({ message: error.message }, { status: 400 });
    }

    return NextResponse.json({ task: data }, { status: 201 });

}


export async function PATCH(request: Request){
    const supabase = await createClient();
    const {data: user, error: userError,} = await supabase.auth.getUser();

    if(userError || !user){
        return NextResponse.json({user: null}, {status: 401});
    }

    const {
        id,
        category_id,
        title,
        startTime,
        endTime,
        startDate,
        endDate,
        description,

    } = await request.json();



     const payload = {
        user_id: user.user.id,
        category_id: category_id,
        title: title.trim(),
        start_date: startDate,
        end_date: endDate,
        start_time: startTime,
        end_time: endTime,
        description,
    }

    const {data, error} = await supabase
        .from("timeline_items")
        .update(payload)
        .eq("id", id)
        .eq("user_id", user.user.id)
        .select("*")
        .single();

    if(error){
        return NextResponse.json({ message: error.message }, { status: 400 });
    }

    return NextResponse.json({ task: data }, { status: 200 });

}

export async function DELETE(request : Request){
    const supabase = await createClient();
    const {data: user, error: userError,} = await supabase.auth.getUser();

    if(userError || !user){
        return NextResponse.json({user: null}, {status: 401});
    }
    
    const { id } = await request.json();
    if(!id){
        return NextResponse.json({ message: "Task id is required" }, { status: 400 });
    }

    const { error } = await supabase
        .from("timeline_items")
        .delete()
        .eq("id", id)
        .eq("user_id", user.user.id);

    if(error){
        return NextResponse.json({ message: error.message }, { status: 400 });
    }

    return NextResponse.json({ message: "Deleted" }, { status: 200 });
}
