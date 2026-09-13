import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";


export async function GET(request: Request) {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return NextResponse.json({ user: null }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const taskType = searchParams.get("task_type");
    const taskGroup = searchParams.get("task_groups");

    // 2. สร้าง Base Query ของ Supabase
    let query = supabase
        .from("custom_filters") 
        .select("*, filter_tasks(category_id)")
        .eq("user_id", user.id);

    if (taskType) {
        query = query.eq("task_type", taskType);
    }
    if (taskGroup) {
        query = query.contains("task_groups", [taskGroup]);
    }

    const { data, error: filterError } = await query;

    if (filterError) {
        return NextResponse.json(
            { message: filterError.message },
            { status: 400 }
        );
    }

    // Map filter_tasks to category_ids array for easy front-end usage
    const mappedData = data ? data.map((filter: any) => {
        const categoryIds = filter.filter_tasks
            ? filter.filter_tasks.map((ft: any) => ft.category_id)
            : [];
        const { filter_tasks, ...rest } = filter;
        return {
            ...rest,
            category_ids: categoryIds
        };
    }) : [];

    return NextResponse.json({ data: mappedData }, { status: 200 });
}

export async function POST(request: Request) {
    const supabase = await createClient();
    const {data: user, error: userError,} = await supabase.auth.getUser();
    
    if(userError || !user){
        return NextResponse.json({user: null}, {status: 401});
    }

    const { name, task_type, task_groups, statuses, dataScope, isAllDay, category_ids } = await request.json();

    const payload = {
        user_id: user.user.id,
        name,
        task_type,
        task_groups,
        statuses,
        date_scope: dataScope,
        is_all_day: isAllDay,
    };

    const { data: filterData, error: filterError } = await supabase
        .from("custom_filters")
        .insert(payload)
        .select("*")
        .single();

    if (filterError) {
        return NextResponse.json({ message: filterError.message }, { status: 400 });
    }

    // Insert category relations if provided
    if (category_ids && Array.isArray(category_ids) && category_ids.length > 0) {
        const relations = category_ids.map((catId: string) => ({
            filter_id: filterData.id,
            category_id: catId
        }));

        const { error: relationError } = await supabase
            .from("filter_tasks")
            .insert(relations);

        if (relationError) {
            // Rollback filter insert if relations insert fails
            await supabase.from("custom_filters").delete().eq("id", filterData.id);
            return NextResponse.json({ message: relationError.message }, { status: 400 });
        }
    }

    return NextResponse.json({ data: { ...filterData, category_ids: category_ids || [] } }, { status: 201 });
}


export async function PATCH(request: Request) {
    const supabase = await createClient();
    const {data: user, error: userError,} = await supabase.auth.getUser();
    
    if(userError || !user){
        return NextResponse.json({user: null}, {status: 401});
    }

    const { id, name, task_type, task_groups, statuses, dataScope, isAllDay, category_ids } = await request.json();

    if (!id || !name?.trim()) {
        return NextResponse.json({ message: "Invalid update data" }, { status: 400 });
    }

    const { data: filterData, error: filterError } = await supabase
        .from("custom_filters")
        .update({
            name,
            task_type,
            task_groups,
            statuses,
            date_scope: dataScope,
            is_all_day: isAllDay,
            updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .eq("user_id", user.user.id)
        .select("*")
        .single();

    if (filterError) {
        return NextResponse.json({ message: filterError.message }, { status: 400 });
    }

    // Clear old relations
    const { error: deleteError } = await supabase
        .from("filter_tasks")
        .delete()
        .eq("filter_id", id);

    if (deleteError) {
        return NextResponse.json({ message: deleteError.message }, { status: 400 });
    }

    // Insert new relations if provided
    if (category_ids && Array.isArray(category_ids) && category_ids.length > 0) {
        const relations = category_ids.map((catId: string) => ({
            filter_id: id,
            category_id: catId
        }));

        const { error: relationError } = await supabase
            .from("filter_tasks")
            .insert(relations);

        if (relationError) {
            return NextResponse.json({ message: relationError.message }, { status: 400 });
        }
    }

    return NextResponse.json({ data: { ...filterData, category_ids: category_ids || [] } }, { status: 200 });
}


export async function DELETE(request: Request) {
    const supabase = await createClient();
    const {data: user, error: userError,} = await supabase.auth.getUser();
    
    if(userError || !user){
        return NextResponse.json({user: null}, {status: 401});
    }
    
    const { id } = await request.json();
    if (!id) {
        return NextResponse.json({ message: "Category id is required" }, { status: 400 });
    }

    const { data, error } = await supabase
        .from("custom_filters")
        .delete()
        .eq("id", id)
        .eq("user_id", user.user.id)
        .select("*, filter_tasks(category_id)")
        .single();

    if (error) {
        return NextResponse.json({ message: error.message }, { status: 400 });
    }

    return NextResponse.json({ data: data }, { status: 200 });
}
