'use server'

import {prisma} from '@/lib/db/prisma';
import { Prisma } from '@prisma/client';
import User from '@/lib/models/user';
import Post from '@/lib/models/post';

const include = {
    user:true,
    userDetails: true,
    parentPost: {
        include: {
            userDetails: true
        }
    }
}

export const getFeed = async (user:User, lastChecked:Date | undefined):Promise<Array<Post>> => {
    const posts:Array<Post> = await prisma.posts.findMany({
        where: {
            OR: [
                { userId: user?.id },
                { userId: {
                    in: user?.userDetails?.following
                }},
            ],
            postType: {
                not: 'chat'
            },
            createdAt: {
                gt: lastChecked
            }
        },
        include,
        orderBy: {
            createdAt: 'desc'
        },
        take: 20
    })

    return posts
}

export const getPosts = async (queryString:string):Promise<Array<Post>> => {
    const posts:Array<Post> = await prisma.posts.findMany({
        where: {
            content: {
                contains: queryString
            }
        },
        include,
        orderBy: {
            createdAt: 'desc'
        }
    })

    return posts
}

export const getPost = async (postId:string):Promise<any> => {
    const post = await prisma.posts.findFirst({
        where: {
            id: postId
        },
        include
    })

    return post;
}

export const getComments = async (postId:string):Promise<any> => {
    const comments = await prisma.posts.findMany({
        where: {
            parentPostId:postId
        },
        include,
        orderBy: {
            createdAt: 'desc'
        }
    })

    return comments;
}

export const savePost = async (postData:any) => {
    const {content, lexical, userId, postType, postFile, postFileType, privatePost, parentPostId, edited} = postData

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
                displayName: '',
                createdAt,
                updatedAt,
                chats: [],
                comments: [],
                followers: [],
                following: [],
                likedPosts: [],
                postIds: [],
            }
        })
    }

    const postDataCreate: Prisma.PostsUncheckedCreateInput = {
        content,
        lexical: lexical ?? null,
        userId,
        userDetailsId: userDetails.id,
        postType: postType ?? null,
        edited,
        postFile: postFile ?? null,
        privatePost: privatePost ?? null,
        parentPostId: parentPostId ?? null,
        createdAt,
        updatedAt,
        ...(postFileType !== undefined ? { postFileType } : {}),
    }

    const post = await prisma.posts.create({
        data: postDataCreate,
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

    if (postType === 'comment' && parentPostId) {
        const parentPost = await prisma.posts.findFirst({
            where: {
                id: parentPostId
            }
        })
        
        await prisma.posts.update({
            where: {
                id: parentPostId
            },
            data: {
                commentCount: ((parentPost?.commentCount) ? parentPost.commentCount : 0) + 1
            }
        })

        if (parentPost && parentPost.userId && userId !== parentPost.userId) {
            const noti = await prisma.notifications.create({
                data: {
                    createdAt: new Date(),
                    type: 'comment',
                    read: false,
                    userId: parentPost.userId, 
                    notiUserId: userId,
                    notiUserDetailsId: userDetails.id,
                    postId: parentPost.id
                },
            })
        }
    }
    
    return post
}

export const editPost = async (postData:any) => {
    const {content, lexical, postId} = postData

    const date = new Date()
    const updatedAt = date

    const post = await prisma.posts.update({
        where: {
            id: postId
        },
        data: {
            content,
            lexical,
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

    if (userDetails && userId !== post.userId) {
        const noti = await prisma.notifications.create({
            data: {
                createdAt: new Date(),
                type: 'like',
                read: false,
                userId: post.userId, 
                notiUserId: userId,
                notiUserDetailsId: userDetails.id,
                postId
            },
        })
    }

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

    await prisma.userDetails.update({
        where: {
            id: userDetails.id
        },
        data: {
            postIds: userDetails.postIds.filter((id:string) => {
                return id !== postId
            })
        }
    })

    await prisma.posts.deleteMany({
        where: {
            parentPostId: postId,
        }
    });

    const deletedPost = await prisma.posts.delete({
        where: {
            id: postId
        }
    })

    if (post.parentPostId) {
        const parentPost = await prisma.posts.findFirst({
            where: {
                id: post.parentPostId
            }
        })

        if (parentPost) {
            await prisma.posts.update({
                where: {
                    id: parentPost.id
                },
                data: {
                    commentCount: (parentPost.commentCount && parentPost.commentCount > 0) ? parentPost.commentCount - 1 : 0
                }
            })
        }
    }

    return deletedPost
}
