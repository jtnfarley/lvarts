import { after } from 'next/server';
import { prisma } from '@/prisma';
import { pushPostActivity } from '@/lib/push';

// Trusted: acts as the given user with NO authorization. Only the guarded actions in
// app/actions/posts.ts call these, passing the id of the logged-in user.
export const likePostDAL = async (postid:number, userdetailsid:number) => {
    const userAlreadyLiked = await prisma.postlikes.findFirst({
        where: {
            postid,
            userdetailsid
        }
    })

    if (userAlreadyLiked) return;

    await prisma.postlikes.create({
        data: {
            postid,
            userdetailsid
        }
    })

    /***** notify post author */

    const postAuthor = await prisma.usertoposts.findFirst({
        where: {
            postid
        }
    })

    if (postAuthor) {
        const notification = await prisma.notifications.create({
            data: {
                notificationtypeid: 1,
                read: false,
                createdat: new Date(),
                postid
            }
        })

        if (notification) {
            await prisma.userstonotifications.create({
                data: {
                    notificationid: notification.id,
                    senderuserdetailsid: userdetailsid,
                    receiveruserdetailsid: postAuthor.userdetailsid
                }
            })

            after(() => pushPostActivity(postAuthor.userdetailsid, userdetailsid, postid, 'liked your post'))
        }
    }
}

export const unlikePostDAL = async  (postid:number, userdetailsid:number) => {
    await prisma.postlikes.deleteMany({
        where: {
            postid,
            userdetailsid
        }
    })
}

