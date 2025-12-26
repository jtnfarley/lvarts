'use client'

import { useParams } from 'next/navigation';
import { useSession } from "next-auth/react";
import {APIProvider} from '@vis.gl/react-google-maps';
import { getEnv } from '@/app/actions/getEnv';
import { currentUser } from '@/app/actions/currentUser';
import AddPostForm from "@/components/forms/AddPostForm"
import CommentFeed from "@/components/Comments/CommentFeed";
import { getPost } from '@/app/actions/posts';
import { useEffect, useState } from 'react';
import User from '@/lib/models/user';
import Post from '@/lib/models/post';
import PostUi from '@/components/PostUi/PostUi';

export default function SinglePost() {
    const [user, setUser] = useState<User | undefined>()
    const [post, setPost] = useState<Post | undefined>()
    const [googleMapsApiKey, setGoogleMapsApiKey] = useState<string | undefined>()
    const params = useParams<{id:string}>();
    const { data: session, status } = useSession();

    const getSinglePost = async () => {
        const gmk = await getEnv('GOOGLE_MAPS');
        setGoogleMapsApiKey(gmk);

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
            {googleMapsApiKey &&
                <APIProvider apiKey={googleMapsApiKey || ''} onLoad={() => console.log('Maps API has loaded.')}>
                    {user && 
                        post &&
                        <div className='py-5 flex flex-col'>
                            <div className='mb-4'>
                                <PostUi postData={post} user={user} googleMapsApiKey={googleMapsApiKey} />
                            </div>
                            <div className='mt-2'>
                                <AddPostForm user={user} postType='comment' edited={false} parentPostId={params.id.toString()}/>
                            </div>
                            <div>
                                <CommentFeed parentPostId={params.id.toString()} user={user} googleMapsApiKey={googleMapsApiKey}/>
                            </div>
                        </div>
                    }        
                </APIProvider>
            }
        </>
	);
}
