type RegisterData = {
    username: string;
    password: string;
    confirmPassword: string;
};

type LoginData = {
    email: string;
    password: string;
};


export async function registerAccount({
    username,
    password,
    confirmPassword,
} : RegisterData) {
    const response = await fetch("/api/auth/register", {
       method: "POST",
       headers: {
        "Content-Type" : "application/json",
       }, 
       body: JSON.stringify({
            username,
            password,
            confirmPassword
       })
    });

    if(!response.ok){
        const errorData = await response.json();
        throw new Error(errorData.message || "Registration failed");
    }

    const data = await response.json();
    const user = data.user;
    if(!user){
        throw new Error("User not found after registration");
    }

    return user;
}


export async function loginAccount({
    email,
    password,
} : LoginData) {
    const response = await fetch("/api/auth/login", {
       method: "POST",
       headers: {
        "Content-Type" : "application/json",
       }, 
       body: JSON.stringify({
            email,
            password,
       })
    });

    if(!response.ok){
        const errorData = await response.json();
        throw new Error(errorData.message || "Login failed");
    }

    const data = await response.json();
    const user = data.user;
    if(!user){
        throw new Error("User not found after login");
    }

    return user;
}


export async function getAccount() {
    const response = await fetch("/api/auth/me", {
        method: "GET",
    });

    if(!response.ok){
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch account data");
    }

    const data = await response.json();
    const account = data.account;
    if(!account){
        return null;
    }
    return account;
}

export async function signOut(){
    const response = await fetch("/api/auth/me", {
        method: "POST"
    });

    if(!response.ok){
        const errorData = await response.json();
        throw new Error(errorData.message || "Sign out failed");
    }

    return;
}