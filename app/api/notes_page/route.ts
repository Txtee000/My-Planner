import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return NextResponse.json({ user: null }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const name = searchParams.get("query");
    const parentId = searchParams.get("parent_id");


    let query = supabase
        .from("note_items")
        .select("*, note_item_categories(category_id)")
        .eq("user_id", user.id);

    if (name) {
        query = query.ilike("name", `%${name}%`);
    }
    if(parentId){
        query = query.eq("parent_id", parentId);
    }else {
        query = query.is("parent_id", null);
    }

    const { data, error: noteError } = await query;

    if (noteError) {
        return NextResponse.json({ message: noteError.message }, { status: 400 });
    }

    // Map note_item_categories to category_ids flat array
    const mappedData = data ? data.map((item: any) => {
        const categoryIds = item.note_item_categories
            ? item.note_item_categories.map((nic: any) => nic.category_id)
            : [];
        const { note_item_categories, ...rest } = item;
        return {
            ...rest,
            category_ids: categoryIds
        };
    }) : [];

    return NextResponse.json({ data: mappedData }, { status: 200 });
}

export async function POST(request: Request) {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return NextResponse.json({ user: null }, { status: 401 });
    }

    const { name, type, parentId, content, category_ids, slug, custom_filter_id, is_table_mode } = await request.json();

    const payload = {
        user_id: user.id,
        name: name.trim(),
        type: type,
        parent_id: parentId || null,
        content: type === "file" ? content : null,
        is_favorite: false,
        slug: slug || null,
        custom_filter_id: custom_filter_id || null,
        is_table_mode: is_table_mode || false,
    };

    const { data: noteData, error: noteError } = await supabase
        .from("note_items")
        .insert(payload)
        .select("*")
        .single();

    if (noteError) {
        return NextResponse.json({ message: noteError.message }, { status: 400 });
    }

    // Insert category relations if provided
    if (category_ids && Array.isArray(category_ids) && category_ids.length > 0) {
        const relations = category_ids.map((catId: string) => ({
            note_item_id: noteData.id,
            category_id: catId
        }));

        const { error: relationError } = await supabase
            .from("note_item_categories")
            .insert(relations);

        if (relationError) {
            // Rollback item insert if relations insert fails
            await supabase.from("note_items").delete().eq("id", noteData.id);
            return NextResponse.json({ message: relationError.message }, { status: 400 });
        }
    }

    return NextResponse.json({ data: { ...noteData, category_ids: category_ids || [] } }, { status: 201 });
}

export async function PATCH(request: Request) {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return NextResponse.json({ user: null }, { status: 401 });
    }

    const { id, name, content, is_favorite, category_ids, slug, custom_filter_id } = await request.json();

    if (!id) {
        return NextResponse.json({ message: "Note item ID is required" }, { status: 400 });
    }

    const updatePayload: any = {
        updated_at: new Date().toISOString()
    };
    if (name !== undefined) updatePayload.name = name.trim();
    if (content !== undefined) updatePayload.content = content;
    if (is_favorite !== undefined) updatePayload.is_favorite = is_favorite;
    if (slug !== undefined) updatePayload.slug = slug;
    if (custom_filter_id !== undefined) updatePayload.custom_filter_id = custom_filter_id;

    const { data: noteData, error: noteError } = await supabase
        .from("note_items")
        .update(updatePayload)
        .eq("id", id)
        .eq("user_id", user.id)
        .select("*")
        .single();

    if (noteError) {
        return NextResponse.json({ message: noteError.message }, { status: 400 });
    }

    // Handle category relations updates if provided
    if (category_ids !== undefined && Array.isArray(category_ids)) {
        // Clear old relations
        const { error: deleteError } = await supabase
            .from("note_item_categories")
            .delete()
            .eq("note_item_id", id);

        if (deleteError) {
            return NextResponse.json({ message: deleteError.message }, { status: 400 });
        }

        // Insert new relations
        if (category_ids.length > 0) {
            const relations = category_ids.map((catId: string) => ({
                note_item_id: id,
                category_id: catId
            }));

            const { error: relationError } = await supabase
                .from("note_item_categories")
                .insert(relations);

            if (relationError) {
                return NextResponse.json({ message: relationError.message }, { status: 400 });
            }
        }
    }

    // Fetch latest linked category ids
    return NextResponse.json({ data: { ...noteData, category_ids: category_ids || [] } }, { status: 200 });
}

export async function DELETE(request: Request) {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return NextResponse.json({ user: null }, { status: 401 });
    }

    const { id } = await request.json();
    if (!id) {
        return NextResponse.json({ message: "ID is required" }, { status: 400 });
    }

    // Deleting the item will trigger ON DELETE CASCADE to remove relations and subfolders
    const { data, error } = await supabase
        .from("note_items")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id)
        .select("*")
        .single();

    if (error) {
        return NextResponse.json({ message: error.message }, { status: 400 });
    }

    return NextResponse.json({ data }, { status: 200 });
}
