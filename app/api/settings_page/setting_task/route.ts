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



export async function GET(request: Request){
    const supabase = await createClient();
    const {data: user, error,} = await supabase.auth.getUser();

    if(error || !user){
        return NextResponse.json({user: null}, {status: 401});
    }
    
    
    const { searchParams } = new URL(request.url);
    const taskType = searchParams.get("task_type");
    const taskGroup = searchParams.get("task_group");
    if (taskType && !isValidTaskType(taskType)) {
        return NextResponse.json({ message: "Invalid task type" }, { status: 400 });
    }

    if (taskGroup && !isValidTaskGroup(taskGroup)) {
        return NextResponse.json({ message: "Invalid task group" }, { status: 400 });
    }

    if (taskType === "activity" && taskGroup) {
        return NextResponse.json(
            { message: "Activity category cannot have task group" },
            { status: 400 }
        );
    }


    let query = supabase
        .from("task_categories")
        .select("*")
        .eq("user_id", user.user.id)
        .order("created_at", { ascending: true });

    if (taskType) {
        query = query.eq("task_type", taskType);
    }

    if (taskGroup) {
        query = query.eq("task_group", taskGroup);
    }
    
    const { data: taskCatetories, error: categoriesError } = await query;
    if (categoriesError) {
        return NextResponse.json(
            { message: categoriesError.message },
            { status: 400 }
        );
    }

    
    return NextResponse.json({ taskCatetories }, { status: 200 });
}





export async function POST(request:Request){
    const supabase = await createClient();
    const {data: user, error: userError,} = await supabase.auth.getUser();
    
    if(userError || !user){
        return NextResponse.json({user: null}, {status: 401});
    }

    const { title, task_type, task_group, color_hex, } = await request.json();

    if (!title?.trim() || !isValidTaskType(task_type)) {
        return NextResponse.json({ message: "Invalid category data" }, { status: 400 });
    }
    if (task_type === "task" && !isValidTaskGroup(task_group)) {
        return NextResponse.json({ message: "Task group is required" }, { status: 400 });
    }

    const payload = {
        user_id: user.user.id,
        task_type,
        title: title.trim(),
        task_group: task_type === "task" ? task_group : null,
        color_hex: color_hex || "#6b7280",
    }

    const { data, error } = await supabase
        .from("task_categories")
        .insert(payload)
        .select("*")
        .single();

    if (error) {
        return NextResponse.json({ message: error.message }, { status: 400 });
    }
    return NextResponse.json({ category: data }, { status: 201 });
}

export async function PATCH(request: Request){
    const supabase = await createClient();
    
    const {data: user, error: userError,} = await supabase.auth.getUser();
    if(userError || !user){
        return NextResponse.json({user: null}, {status: 401});
    }

    const { id, title, color_hex } = await request.json();
    if (!id || !title?.trim()) {
        return NextResponse.json({ message: "Invalid update data" }, { status: 400 });
    }


    const { data, error } = await supabase
        .from("task_categories")
        .update({
            title: title.trim(),
            color_hex,
            updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .eq("user_id", user.user.id)
        .select("*")
        .single();

    if (error) {
        return NextResponse.json({ message: error.message }, { status: 400 });
    }
    return NextResponse.json({ category: data }, { status: 200 });

}

export async function DELETE(request: Request){
    const supabase = await createClient();

    const {data: user, error: userError,} = await supabase.auth.getUser();
    if(userError || !user){
        return NextResponse.json({user: null}, {status: 401});
    }

    const { id } = await request.json();
    if (!id) {
        return NextResponse.json({ message: "Category id is required" }, { status: 400 });
    }
    const { error } = await supabase
        .from("task_categories")
        .delete()
        .eq("id", id)
        .eq("user_id", user.user.id);

    if (error) {
        return NextResponse.json({ message: error.message }, { status: 400 });
    }

    return NextResponse.json({ message: "Deleted" }, { status: 200 });
}