import { createClient } from "@/lib/supabase/client";

type SubmitResetPasswordParams = {
    confirmPassword: string;
    password: string;
};

export async function submitResetPassword({
    confirmPassword,
    password,
}: SubmitResetPasswordParams) {
    if(!password || !confirmPassword){
        throw new Error("Please fill in all fields");
    }

    if(password !== confirmPassword){
        throw new Error("Password don't match");
    }

    const supabase = createClient();
    const {error} = await supabase.auth.updateUser({password});

    if(error){
        throw new Error(error.message || "Failed to update password");
    }

    return true;
}
