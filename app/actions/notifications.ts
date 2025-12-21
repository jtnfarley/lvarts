'use server'

import {prisma} from '@/lib/db/prisma';
import User from '@/lib/models/user';
import Notification from '@/lib/models/notification';

const include = {
    user:true,
    notiUser: true,
    notiUserDetails: true,
    post:true
}

export const getNotifications = async (user:User):Promise<Array<Notification>> => {
    const notifications:Array<Notification> = await prisma.notifications.findMany({
        where: {
            userId: user?.id,
        },
        include,
        orderBy: {
            createdAt: 'desc'
        }
    })

    return notifications
}

export const hasNewNotifications = async (user:User):Promise<boolean> => {
    const notifications:Array<Notification> = await prisma.notifications.findMany({
        where: {
            userId: user?.id,
            read: false
        }
    })

    return (notifications.length) ? true : false
}

export const updateNotis = async (notis:Notification[] | undefined) => {
    if (notis && notis.length) {
        notis.forEach(async noti => {
            await prisma.notifications.update({
                where: {
                    id: noti.id
                },
                data: {
                    read: true
                }
            })
        })
    }
}