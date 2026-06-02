import { createClient } from "@/lib/supabase/client";

type SubmitForgotPasswordParams = {
    email: string;
    redirectTo: string;
};

export async function submitForgotPassword({
    email,
    redirectTo,
}: SubmitForgotPasswordParams) {
    if(!email){
        throw new Error("Please enter your email");
    }

    const supabase = createClient();
    const {error} = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo,
    });

    if(error){
        throw new Error(error.message || "Failed to send reset password email");
    }

    return true;
}
