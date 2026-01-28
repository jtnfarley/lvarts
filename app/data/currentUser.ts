import { auth } from "@/auth";
import User from "@/lib/models/user";
import { redirect } from "next/navigation";

export const currentUser = async ():Promise<User> => {
    const session = await auth();

    if (!session?.user || !session?.user?.id) {
        return redirect('/');
    } 
    
    return session.user as User;
}

export const isLoggedIn =  async ():Promise<User | undefined> => {
    const session = await auth();

    if (!session?.user || !session?.user?.id) {
        return undefined;
    } 
    
    return session.user as User;
}