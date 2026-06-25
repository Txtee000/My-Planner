import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";


function isValidTaskStatus(value: string): value is TaskStatus {
    return value === "not_started" || value === "in_progress" || value === "done";
}



function isValidDeadline(value: string){
    return !Number.isNaN(new Date(value).getTime());
}

function isValidDateOnly(value: string){
    if(!/^\d{4}-\d{2}-\d{2}$/.test(value)){
        return false;
    }

    return !Number.isNaN(new Date(`${value}T00:00:00`).getTime());
}

function isValidTimeOnly(value: string){
    return /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}

function isValidBoolean(value: unknown): value is boolean {
    return typeof value === "boolean";
}

function getBangkokDateKey(date: Date){
    return new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Bangkok",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).format(date);
}

async function isUserCategory(
    supabase: Awaited<ReturnType<typeof createClient>>,
    categoryId: string,
    userId: string,
) {
    const { data, error } = await supabase
        .from("task_categories")
        .select("id")
        .eq("id", categoryId)
        .eq("user_id", userId)
        .maybeSingle();

    return !error && !!data;
}

export async function GET(request: Request){
    const supabase = await createClient();
    const {data: user, error,} = await supabase.auth.getUser();

    if(error || !user){
        return NextResponse.json({user: null}, {status: 401});
    }

    const { searchParams } = new URL(request.url);
    const taskStatus = searchParams.get("task_status");
    const categoryId = searchParams.get("category_id");
    const isAllDay = searchParams.get("is_all_day");
    const excludeTaskStatus = searchParams.get("exclude_task_status");
    const overdue = searchParams.get("overdue");
    const position = searchParams.get("position");
    const created_at = searchParams.get("created_at");
    const taskId = searchParams.get("taskId");
    const deadlineDate = searchParams.get("deadline_date");
    


    if(taskStatus && !isValidTaskStatus(taskStatus)){
        return NextResponse.json({ message: "Invalid task status" }, { status: 400 });
    }

    if(isAllDay && isAllDay !== "true" && isAllDay !== "false"){
        return NextResponse.json({ message: "Invalid all day value" }, { status: 400 });
    }
    if(position && position !== "true" && position !== "false"){
        return NextResponse.json({ message: "Invalid all day value" }, { status: 400 });
    }
    if(created_at && created_at !== "true" && created_at !== "false"){
        return NextResponse.json({ message: "Invalid all day value" }, { status: 400 });
    }
    if(excludeTaskStatus && !isValidTaskStatus(excludeTaskStatus)){
        return NextResponse.json({ message: "Invalid excluded task status" }, { status: 400 });
    }
    if(overdue && overdue !== "true" && overdue !== "false"){
        return NextResponse.json({ message: "Invalid overdue value" }, { status: 400 });
    }

    let query = supabase
        .from("task_items")
        .select("*")
        .eq("user_id", user.user.id)
    if(taskStatus){
        query = query.eq("task_status", taskStatus);
    }

    if(categoryId){
        query = query.eq("category_id", categoryId);
    }

    if(isAllDay){
        query = query.eq("is_all_day", isAllDay === "true");
    }
    if(excludeTaskStatus){
        query = query.neq("task_status", excludeTaskStatus);
    }

    if(position){
        query = query.order("position", { ascending: true });
    }
    if(created_at){
        query = query.order("created_at", { ascending: true });
    }
    if(overdue){ // เกินกำหนด 
        const today = getBangkokDateKey(new Date());
        query = query
            .not("deadline_date", "is", null)
            .or(`and(deadline_date.lt.${today},task_status.neq.done),deadline_date.gte.${today}`) 
            .order("deadline_date", { ascending: true });
    }
    if(taskId){
        query = query.eq("id", taskId);
    }
    if(deadlineDate){
        query = query.eq("deadline_date", deadlineDate);
    }


    const { data: tasks, error: tasksError } = await query;

    if(tasksError){
        return NextResponse.json({ message: tasksError.message }, { status: 400 });
    }

    return NextResponse.json({ tasks }, { status: 200 });
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
        position,
        deadline_date,
        deadline_time,
        task_status = "not_started",
        description,
        is_all_day = true,
    } = await request.json();

    if(typeof title !== "string" || !title.trim() || !Number.isInteger(position)){
        return NextResponse.json({ message: "Invalid task data" }, { status: 400 });
    }

    if(!isValidTaskStatus(task_status)){
        return NextResponse.json({ message: "Invalid task status" }, { status: 400 });
    }

    if(!isValidBoolean(is_all_day)){
        return NextResponse.json({ message: "Invalid all day value" }, { status: 400 });
    }

    if(typeof deadline_date !== "string" || !isValidDateOnly(deadline_date)){
        return NextResponse.json({ message: "Invalid deadline date" }, { status: 400 });
    }

    if(!is_all_day && (typeof deadline_time !== "string" || !isValidTimeOnly(deadline_time))){
        return NextResponse.json({ message: "Invalid deadline time" }, { status: 400 });
    }

    if(is_all_day && deadline_time){
        return NextResponse.json({ message: "All day tasks must not include deadline time" }, { status: 400 });
    }

    if(category_id && !(await isUserCategory(supabase, category_id, user.user.id))){
        return NextResponse.json({ message: "Invalid category" }, { status: 400 });
    }

    const payload = {
        user_id: user.user.id,
        category_id: category_id || null,
        title: title.trim(),
        position,
        deadline_date,
        deadline_time: is_all_day ? null : deadline_time,
        task_status,
        description: typeof description === "string" && description.trim() ? description.trim() : null,
        is_all_day,
    };

    const { data, error } = await supabase
        .from("task_items")
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
        position,
        deadline_date,
        deadline_time,
        task_status,
        description,
        is_all_day,
    } = await request.json();

    if(!id){
        return NextResponse.json({ message: "Task id is required" }, { status: 400 });
    }

    if(title !== undefined && (typeof title !== "string" || !title.trim())){
        return NextResponse.json({ message: "Invalid task title" }, { status: 400 });
    }

    if(position !== undefined && !Number.isInteger(position)){
        return NextResponse.json({ message: "Invalid task position" }, { status: 400 });
    }

    if(task_status !== undefined && !isValidTaskStatus(task_status)){
        return NextResponse.json({ message: "Invalid task status" }, { status: 400 });
    }

    if(is_all_day !== undefined && !isValidBoolean(is_all_day)){
        return NextResponse.json({ message: "Invalid all day value" }, { status: 400 });
    }

    if(deadline_date !== undefined && (typeof deadline_date !== "string" || !isValidDateOnly(deadline_date))){
        return NextResponse.json({ message: "Invalid deadline date" }, { status: 400 });
    }

    if(deadline_time !== undefined && deadline_time !== null && (typeof deadline_time !== "string" || !isValidTimeOnly(deadline_time))){
        return NextResponse.json({ message: "Invalid deadline time" }, { status: 400 });
    }

    if(category_id && !(await isUserCategory(supabase, category_id, user.user.id))){
        return NextResponse.json({ message: "Invalid category" }, { status: 400 });
    }

    const payload: {
        category_id?: string | null;
        title?: string;
        position?: number;
        deadline_date?: string | null;
        deadline_time?: string | null;
        task_status?: TaskStatus;
        description?: string | null;
        is_all_day?: boolean;
        updated_at: string;
    } = {
        updated_at: new Date().toISOString(),
    };

    if(category_id !== undefined){
        payload.category_id = category_id || null;
    }
    if(title !== undefined){
        payload.title = title.trim();
    }
    if(position !== undefined){
        payload.position = position;
    }
    if(deadline_date !== undefined){
        payload.deadline_date = deadline_date || null;
    }
    if(deadline_time !== undefined){
        payload.deadline_time = deadline_time || null;
    }
    if(task_status !== undefined){
        payload.task_status = task_status;
    }
    if(description !== undefined){
        payload.description = typeof description === "string" && description.trim() ? description.trim() : null;
    }
    if(is_all_day !== undefined){
        payload.is_all_day = is_all_day;
        if(is_all_day){
            payload.deadline_time = null;
        }
    }

    const { data, error } = await supabase
        .from("task_items")
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

export async function DELETE(request: Request){
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
        .from("task_items")
        .delete()
        .eq("id", id)
        .eq("user_id", user.user.id);

    if(error){
        return NextResponse.json({ message: error.message }, { status: 400 });
    }

    return NextResponse.json({ message: "Deleted" }, { status: 200 });
}
