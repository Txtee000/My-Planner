import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request){
    const supabase = await createClient();
    const {email, password} = await request.json();

    if(!email || !password){
        return NextResponse.json(
            {message: "Please fill in all fields"},
            {status: 400}
        );
    }

    const {data, error} = await supabase.auth.signInWithPassword({email, password}); //ส่งเเบบ obj
    if(error){
        return NextResponse.json({message: "Login failed"}, {status: 400});
    }
    return NextResponse.json({user: data.user, message:"Login successful"}, {status: 200});
}