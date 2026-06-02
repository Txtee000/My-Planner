import { loginAccount } from "@/services/authService";
import { FormEvent } from "react"

// type AuthResponse = {
//     message?: string;
//     user?: unknown;
// };

// export async function submitLoginForm(formData: FormData) {
//     const payload = Object.fromEntries(formData.entries());

//     const response = await fetch("/api/auth/login", {
//         method: "POST",
//         headers: {
//             "Content-Type": "application/json",
//         },
//         body: JSON.stringify(payload),
//     });

//     const result = (await response.json()) as AuthResponse;

//     if(!response.ok){
//         throw new Error(result.message ?? "Login failed");
//     }

//     return result;
// }



type SubmitFormParams = {
    event: FormEvent<HTMLFormElement>
    email: string;
    password: string;

    setEmail: React.Dispatch<React.SetStateAction<string>>;
    setPassword: React.Dispatch<React.SetStateAction<string>>;
}


export async function submitLoginForm({
    event,
    email,
    password,

    setEmail,
    setPassword,
} : SubmitFormParams) {
    event.preventDefault();

    if(!email || !password){
        alert("Please fill in all fields");
        return false;
    }

    const user = await loginAccount({
        email,
        password,
    });
    if(!user){
        console.error("Login failed");
        return false;
    }

    clearData(setEmail,setPassword);
    return true;
}

function clearData(
    setEmail: React.Dispatch<React.SetStateAction<string>>,
    setPassword: React.Dispatch<React.SetStateAction<string>>,
){
    setEmail("");
    setPassword("");
}   