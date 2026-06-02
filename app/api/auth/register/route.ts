import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

type GoogleUserMetadata = {
    avatar_url?: string;
    picture?: string;
    sub?: string;
};

export async function POST(request: Request) {
    const supabase = await createClient();
    const {username, password, confirmPassword} = await request.json();

    if(!username || !password || !confirmPassword){
        return NextResponse.json(
            {message: "Please fill in all fields"},
            {status: 400}
        );
    }

    if(password !== confirmPassword){
        return NextResponse.json(
            {message: "Password don't match"},
            {status: 400}
        );
    }

    const {
        data: {user},
        error: userError,
    } = await supabase.auth.getUser();

    if(userError || !user?.email){
        return NextResponse.json(
            {message: "Please link your Google email before registering"},
            {status: 401}
        );
    }

    // เพ่ิท password เข้าไปที่ auth
    const {error: passwordError} = await supabase.auth.updateUser({password});
    if(passwordError){
        return NextResponse.json(
            {message: "Failed to set password for this Google account"},
            {status: 400}
        );
    }
    // อ่านค่า google
    const metadata = user.user_metadata as GoogleUserMetadata; 
    const accountData = {
        id: user.id,
        username,
        email: user.email,
        google_subject: metadata.sub,
        avatar_url: metadata.avatar_url ?? metadata.picture,
    };

    const {data: existingAccount, error: findAccountError} = await supabase
        .from("accounts")
        .select("id")
        .eq("email", user.email)
        .maybeSingle();

    if(findAccountError){
        return NextResponse.json(
            {message: "Failed to check existing account"},
            {status: 400}
        );
    }

    const {error: accountError} = existingAccount
        ? await supabase
            .from("accounts")
            .update(accountData)
            .eq("id", existingAccount.id)
        : await supabase
            .from("accounts")
            .insert(accountData);

    if(accountError){
        return NextResponse.json(
            {message: "Failed to create user account"},
            {status: 400}
        );
    }

    return NextResponse.json(
        {user, message: "Registration Successful"},
        {status: 200}
    );
}
