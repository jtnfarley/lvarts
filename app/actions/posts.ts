'use server'

import {prisma} from '@/lib/db/prisma'

export const savePost = async (postData:any) => {
    const {content, userId, postType, postFile, privatePost, parentPostId, edited} = postData

    const date = new Date()
    const createdAt = date
    const updatedAt = date

    let userDetails = await prisma.userDetails.findFirst({
        where: {
            userId: userId
        }
    })

    if (!userDetails) {
        userDetails = await prisma.userDetails.create({
            data: {
                userId,
                createdAt,
                updatedAt
            }
        })
    }

    const post = await prisma.posts.create({
        data: {
            content, 
            userId,
            userDetailsId: userDetails.id,
            postType,
            edited,
            postFile,
            privatePost,
            parentPostId,
            createdAt,
            updatedAt
        },
    })

    await prisma.userDetails.update({
        where: {
            id: userDetails.id
        },
        data: {
            updatedAt: new Date(),
            postIds: [...userDetails.postIds, post.id]
        }
    })
    
    return post
}

export const editPost = async (postData:any) => {
    const {content, postId} = postData

    const date = new Date()
    const updatedAt = date

    const post = await prisma.posts.update({
        where: {
            id: postId
        },
        data: {
            content,
            edited: true,
            updatedAt
        }
    })

    return post
}

export const likePost = async (postId:string, userId:string) => {
    const post = await prisma.posts.findFirst({
        where: {
            id: postId
        }
    })

    if (!post) {
        return null
    }

    const userDetails = await prisma.userDetails.findFirst({
        where: {
            userId: userId
        }
    })

    if (!userDetails) {
        return null
    }

    const updatedPost = await prisma.posts.update({
        where: {
            id: postId
        },
        data: {
            likes: ((post.likes) ? post.likes : 0) + 1
        }
    })

    await prisma.userDetails.update({
        where: {
            id: userDetails.id
        },
        data: {
            likedPosts: [...userDetails.likedPosts, postId]
        }
    })

    return updatedPost
}

export const unlikePost = async (postId:string, userId:string) => {
    const post = await prisma.posts.findFirst({
        where: {
            id: postId
        }
    })

    if (!post) {
        return null
    }

    const userDetails = await prisma.userDetails.findFirst({
        where: {
            userId: userId
        }
    })

    if (!userDetails) {
        return null
    }

    const updatedPost = await prisma.posts.update({
        where: {
            id: postId
        },
        data: {
            likes: ((post.likes)) ? post.likes - 1 : 0
        }
    })

    const likedPosts = userDetails.likedPosts.filter((likedPostId:string) => {
        return likedPostId !== postId
    })

    await prisma.userDetails.update({
        where: {
            id: userDetails.id
        },
        data: {
            likedPosts
        }
    })

    return updatedPost
}

export const deletePost = async (postId:string) => {
    const post = await prisma.posts.findFirst({
        where: {
            id: postId
        }
    })

    if (!post) {
        return null
    }

    const userDetails = await prisma.userDetails.findFirst({
        where: {
            userId: post.userId
        }
    })

    if (!userDetails) {
        return null
    }

    const updatedUserDetails = await prisma.userDetails.update({
        where: {
            id: userDetails.id
        },
        data: {
            postIds: userDetails.postIds.filter((id:string) => {
                return id !== postId
            })
        }
    })

    const deletedPost = await prisma.posts.delete({
        where: {
            id: postId
        }
    })

    return deletedPost
}