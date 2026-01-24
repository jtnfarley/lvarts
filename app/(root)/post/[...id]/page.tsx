import Link from 'next/link';
import { currentUser } from '@/app/actions/currentUser';
import AddPostForm from "@/components/forms/AddPostForm"
import CommentFeed from "@/components/Comments/CommentFeed";
import SinglePost from '@/components/SinglePost';
import { redirect } from 'next/navigation';
import { prisma } from '@/prisma';

// import { useParams } from 'next/navigation';
// import { useSession } from "next-auth/react";
// import {APIProvider} from '@vis.gl/react-google-maps';
// import { getEnv } from '@/app/actions/getEnv';


// import { getPost } from '@/app/actions/posts';
// import { useEffect, useState } from 'react';
// import User from '@/lib/models/user';
// import Post from '@/lib/models/post';

const getPost = async (postId:string):Promise<any> => {
    const post = await prisma.posts.findFirst({
        where: {
            id: postId
        },
        include: {
            user:true,
            userDetails: true,
            parentPost: {
                include: {
                    userDetails: true
                }
            }
        }
    })

    return post;
}

const getInitComments = async (postId:string):Promise<any> => {
    const comments = await prisma.posts.findMany({
        where: {
            parentPostId:postId
        },
        include: {
            user:true,
            userDetails: true,
            parentPost: {
                include: {
                    userDetails: true
                }
            }
        },
        orderBy: {
            createdAt: 'desc'
        },
        take: 20
    })

    return comments;
}

const getNewComments = async (postId:string, lastChecked:Date):Promise<any> => {
    'use server'
    
    const comments = await prisma.posts.findMany({
        where: {
            parentPostId:postId,
            createdAt: { gt: lastChecked }
        },
        include: {
            user:true,
            userDetails: true,
            parentPost: {
                include: {
                    userDetails: true
                }
            }
        },
        orderBy: {
            createdAt: 'desc'
        }
    })

    return comments;
}

const getOldComments = async (postId:string, skip?:number):Promise<any> => {
    'use server'
    
    const comments = await prisma.posts.findMany({
        where: {
            parentPostId:postId
        },
        include: {
            user:true,
            userDetails: true,
            parentPost: {
                include: {
                    userDetails: true
                }
            }
        },
        orderBy: {
            createdAt: 'desc'
        },
        take: 20,
        skip: (skip) ? skip + 1 : 0
    })

    return comments;
}


export default async function SinglePostPage({
  params,
}: {
  params: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const { id } = await params;

    const getUser = async () => {
        'use server'
        return await currentUser()
    }

    const user = await getUser();

    if (!user) return redirect('/');

    const googleMapsApiKey = process.env.GOOGLE_MAPS;

    let post, comments;
    
    if (id) {
        post = await getPost(id.toString());
        comments = await getInitComments(id.toString());
    }

    if (!post) return redirect('/home');

	return (
        <>
        {(user) ?
            (post && id && googleMapsApiKey) &&           
                <div className='py-5 flex flex-col'>
                    <div className='mb-4'>
                        <SinglePost post={post} user={user} googleMapsApiKey={googleMapsApiKey} />
                    </div>
                    <div className='mt-2'>
                        <AddPostForm user={user} postType='comment' edited={false} parentPostId={id.toString()}/>
                    </div>
                    <div>
                        <CommentFeed comments={comments} parentPostId={id.toString()} user={user} getNewComments={getNewComments} getOldComments={getOldComments} googleMapsApiKey={googleMapsApiKey}/>
                    </div>
                </div>
                :
                <div className='rounded-box'>
                    <Link href={'/'} className='text-primary'>Log in to view full post</Link>
                </div>      
            }
        </>
	);
}
