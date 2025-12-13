'use client'

import { useParams } from 'next/navigation';
import { useSession } from "next-auth/react";
import { currentUser } from '@/app/actions/currentUser';
import AddPostForm from "@/components/forms/AddPostForm"
import CommentFeed from "@/components/shared/Comments/CommentFeed";
import { getPost } from '@/app/actions/posts';
import { useEffect, useState } from 'react';
import User from '@/lib/models/user';
import Post from '@/lib/models/post';
import PostUi from '@/components/shared/PostUi/PostUi';

export default function SinglePost() {
    const [user, setUser] = useState<User | undefined>()
    const [post, setPost] = useState<Post | undefined>()
    const params = useParams<{id:string}>();
    const { data: session, status } = useSession();

    const getSinglePost = async () => {
        const singlePost = await getPost(params.id.toString())
        if (!singlePost) return

        setPost(singlePost);
    }

    const getCurrentUser = async () => {
        const currUser = await currentUser()
        if (!currUser) return

        setUser(currUser);
    }

    useEffect(() => {
        if (status === 'authenticated') {
            getCurrentUser()
            getSinglePost()
        }      
    },[session])

	return (
		<>
        {user && 
            post &&
            <div>
                <div className='mb-4'>
                    <PostUi postData={post} user={user} />
                </div>
                <div className='mt-2'>
                    <AddPostForm user={user} postType='comment' edited={false} parentPostId={params.id.toString()}/>
                </div>
                <div>
                    <CommentFeed parentPostId={params.id.toString()} user={user}/>
                </div>
            </div>
        }        
		</>
	);
}
