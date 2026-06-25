import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";


export async function GET(request: Request){
    const supabase = await createClient();
    const {data: user, error,} = await supabase.auth.getUser();


    if(error || !user){
        return NextResponse.json({user: null}, {status: 401});
    }

    const { searchParams } = new URL(request.url);

    // check params

    // query

    let query = supabase
        .from("timeline_items")
        .select("*")
        .eq("user_id", user.user.id)


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
        position,
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
        position,
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
        position,
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
        position,
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