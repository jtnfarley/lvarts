'use server'

import {prisma} from '@/lib/db/prisma'

export const getUserDetails = async (userId:string) => {
    const userDetails = await prisma.userDetails.findFirst({
        where: {
            userId
        }
    })

    return userDetails
}