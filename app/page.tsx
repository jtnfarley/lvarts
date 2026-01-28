import {isLoggedIn} from "@/app/data/currentUser";
import LandingPage from '@/components/LandingPage';
import { redirect } from "next/navigation";
 
export default async function SignIn() {
    const user = await isLoggedIn();

    if (user) return redirect('/home');

    return (
        <div className="flex items-center justify-center h-screen">
            <LandingPage/>
        </div>
    )
}