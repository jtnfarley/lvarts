'use server'

import { auth } from '@/auth';
import { getUserDetails } from "@/app/actions/user";
import User from '../../lib/models/user';
import UserDetails from '../../lib/models/userDetails';

export const currentUser = async ():Promise<User | undefined> => {
    const session = await auth();

    if (!session?.user || !session?.user?.id) {
        return
    }

    const user:User = session?.user as User;
    let userDetails:UserDetails;

    if (user.id) {
        userDetails = await getUserDetails(user.id) as UserDetails;

        if (userDetails) {
            user.userDetails = userDetails
        }

        return user
    }

    return
}