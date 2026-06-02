import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
    const supabase = await createClient();
    const {
        data: user,
        error,
    } = await supabase.auth.getUser();

    if(error || !user){
        return NextResponse.json({user: null}, {status: 401});
    }

    const {data: account} = await supabase
        .from("accounts")
        .select("*")
        .eq("id", user.user.id)
        .maybeSingle();

    console.log(account);
    return NextResponse.json({user, account}, {status: 200});
}


export async function POST() {
    const supabase = await createClient();
    const {error} = await supabase.auth.signOut();

    if(error){
        return NextResponse.json(
            {message: "Sign out failed"},
            {status: 500}
        );
    }

    return NextResponse.json({
        message: "Sign out success",
    })
}