import type SidebarProfile from '@/lib/models/sidebarProfile'
import { prisma } from '@/prisma'

export const getSidebarProfile = async (handle:string): Promise<SidebarProfile | null> => {
    const profile = await prisma.userdetails.findFirst({
        where: {
            handle
        },
        select: {
            id: true,
            userid: true,
            handle: true,
            displayname: true,
            avatar: true,
            userdir: true,
            biohtml: true,
            biolexical: true
        }
    })

    if (!profile) return null;

    const postcount = await prisma.usertoposts.count({
        where: {
            userdetailsid: profile.id
        }
    })

    const followingcount = await prisma.followers.count({
        where: {
            userdetailsid: profile.id
        }
    })

    const followerscount = await prisma.followers.count({
        where: {
            followinguserdetailsid: profile.id
        }
    })

    const urls = await prisma.userdetailsurls.findMany({
        where: {
            userdetailsid: profile.id
        }
    })

    return {
        ...profile,
        followers: [],
        following: [],
        postcount,
        followerscount,
        followingcount,
        urls: urls.map((url) => ({
            id: url.id,
            url: url.url,
            urlname: url.urlname ?? ''
        }))
    }
}
