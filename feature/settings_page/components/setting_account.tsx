import { signOut } from "@/services/authService";
import { useRouter } from "next/navigation";

export function Setting_account(){

    const router = useRouter();

    async function handleSignout(){
        try{
            await signOut();
            router.push("/login");
            router.refresh();
        }
        catch(error){
            console.error("Sign out error: ", error);
        }
    }


    return(
        <div>
            <button onClick={handleSignout} className="text-white m-4 hover:underline">Sign out</button>
        </div>
    );
}