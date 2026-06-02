import { registerAccount } from "@/services/authService";

type SubmitFormParams = {
    username: string;
    password: string;
    confirmPassword: string;

    setUsername: React.Dispatch<React.SetStateAction<string>>;
    setPassword: React.Dispatch<React.SetStateAction<string>>;
    setConfirmPassword: React.Dispatch<React.SetStateAction<string>>;
}

export async function submitRegisterForm({
    username,
    password,
    confirmPassword,

    setUsername,
    setPassword,
    setConfirmPassword,

} : SubmitFormParams) {
    if(password != confirmPassword){
        alert("Password do not match");
        return false;
    }
    if(!username || !password || !confirmPassword){
        alert("Please fill in all fields");
        return false;
    }

    const user = await registerAccount({
        username,
        password,
        confirmPassword,
    });
    if(!user){
        console.error("Registration failed");
        return false;
    }

    clearData(setUsername,setPassword,setConfirmPassword);
    return true;
}

function clearData(
    setUsername: React.Dispatch<React.SetStateAction<string>>,
    setPassword: React.Dispatch<React.SetStateAction<string>>,
    setConfirmPassword: React.Dispatch<React.SetStateAction<string>>,
){
    setUsername("");
    setPassword("");
    setConfirmPassword("");
}
