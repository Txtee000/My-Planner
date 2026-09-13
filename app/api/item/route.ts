import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";



function getBangkokDateKey(date: Date){
    return new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Bangkok",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).format(date);
}




export async function GET(request: Request){

    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return NextResponse.json({ user: null }, { status: 401 });
    }


    const { searchParams } = new URL(request.url);
    const name = searchParams.get("query");
    const parentId = searchParams.get("parent_id");
    const type = searchParams.get("type");
    const taskStatus = searchParams.get("taskStatus");
    const favorite = searchParams.get("favorite");
    const position = searchParams.get("position");
    const overdue = searchParams.get("overdue");
    const isAllDay = searchParams.get("isAllDay");
    const itemId = searchParams.get("itemId");
    const deadlineDate = searchParams.get("deadline_date");





    let query = supabase
      .from('items')
      .select(`
        id,
        name,
        type,
        is_favorite,
        created_at,
        tasks (
          position,
          task_status,
          start_time,
          end_time
        ),
        files (
          link
        )
      `)
      .eq('user_id', user.id);
    if (type) {
      query = query.eq('type', type);
    }
    if(favorite){
        query = query.eq('is_favorite', favorite);
    }
    if (name) {
      query = query.ilike('name', `%${name}%`);
    }
    if (parentId) {
        query = query.eq('parent_id', parentId);
    } else if (!name) {
        query = query.is('parent_id', null);
    }
    if(itemId){
        query = query.eq('id', itemId);
    }



    // task //
    if(position){
        query = query.order("position", { ascending: true });
    }
    if(overdue){ // เกินกำหนด 
        const today = getBangkokDateKey(new Date());
        query = query
            .not("deadline_date", "is", null)
            .or(`and(deadline_date.lt.${today},task_status.neq.done),deadline_date.gte.${today}`) 
            .order("deadline_date", { ascending: true });
    }
    if(taskStatus){
        query = supabase
            .from('items')
            .select(`
                id,
                name,
                type,
                is_favorite,
                created_at,
                tasks (
                position,
                task_status,
                start_time,
                end_time
                ),
                files (
                link
                )
            `)
            .eq('user_id', user.id)
            .eq('tasks.task_status', taskStatus);
    }
    if(isAllDay){
        query = query.eq("is_all_day", isAllDay === "true");
    }
    if(deadlineDate){
        query = query.eq("deadline_date", deadlineDate);
    }


    const { data: items, error: itemsError } = await query;
    


    return NextResponse.json({ data: items }, { status: 200 });
}



export async function POST(request: Request){
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return NextResponse.json({ user: null }, { status: 401 });
    }



    const {
        type = "task", // ค่าเริ่มต้นเป็น task ป้องกัน API เดิมพัง
        parent_id = null,
        category_ids = [], // เก็บ category เพื่อเอาไปเพิ่ม
        name,
        parentId, 
        isFavorite,
        
        
        // --- ส่วนของ Task ---
        position = 0,
        deadline_date,
        deadline_time,
        task_status = "not_started",
        is_all_day = true,
        
        // --- ส่วนของ File ---
        link, // URL ของไฟล์ที่อัปโหลดเสร็จแล้ว
        
        // --- ใช้ร่วมกัน ---
        description,
    } = await request.json();




    // add ลง items
    const itemPayload = {
        user_id: user.id,
        parent_Id: parentId,
        type: "task",
        name: name.trim(),
        is_favorite: isFavorite,
    };
    const {data: newItem, error: itemError} = await supabase
        .from("items")
        .insert(itemPayload)
        .select("*")
        .single();

    if (itemError) {
        return NextResponse.json({ message: itemError.message }, { status: 400 });
    }

    if(type == "task"){
        // add ลง tasks
        const taskPayload = {
            item_id: newItem.id,
            position: position,
            description,
            deadline_date,
            deadline_time,
            is_all_day,
            task_status,
        }

        const {data: newTask, error: taskError} = await supabase
            .from("tasks")
            .insert(taskPayload)
            .select("*")
            .single()

            if (taskError) {
                await supabase.from("items").delete().eq("id", newItem.id); // Rollback
                return NextResponse.json({ message: "Failed to create task details" }, { status: 400 });
            }
    }
    else if(type == "file"){
        if (!link || typeof link !== "string") {
            await supabase.from("items").delete().eq("id", newItem.id); // Rollback ถ้าไม่มี link ส่งมา
            return NextResponse.json({ message: "File link is required" }, { status: 400 });
        }

        const filePayload = {
            item_id: newItem.id,
            description: description?.trim() || null,
            link: link.trim()
        };
        const { data: fileData, error: fileError } = await supabase
            .from("files")
            .insert(filePayload)
            .select("*")
            .single();

        if (fileError) {
            await supabase.from("items").delete().eq("id", newItem.id); // Rollback
            return NextResponse.json({ message: "Failed to save file details: " + fileError.message }, { status: 400 });
        }
    }


    // บันทึก Categories (ถ้ามี)
    if (category_ids.length > 0) {
        const relations = category_ids.map((catId: string) => ({
            task_item_id: newItem.id,
            category_id: catId,
        }));
        
        const { error: relError } = await supabase.from("task_item_categories").insert(relations);
        
        if (relError) {
            await supabase.from("items").delete().eq("id", newItem.id);
            return NextResponse.json({ message: "Failed to link categories" }, { status: 400 });
        }
    }


    return NextResponse.json({ success: true }, { status: 201 });

}


export async functo