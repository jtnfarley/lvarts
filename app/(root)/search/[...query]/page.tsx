'use client'

import { useParams } from 'next/navigation';
import { useSession } from "next-auth/react";
import {APIProvider} from '@vis.gl/react-google-maps';
import { getEnv } from '@/app/actions/getEnv';
import { currentUser } from '@/app/actions/currentUser';
import { getPosts } from '@/app/actions/posts';
import { useEffect, useState } from 'react';
import User from '@/lib/models/user';
import Post from '@/lib/models/post';
import PostUi from '@/components/PostUi/PostUi';

export default function Search() {
    const [user, setUser] = useState<User | undefined>()
    const [posts, setPosts] = useState<Post[] | undefined>()
    const [renderKey, setRenderKey] = useState(0);
    const [googleMapsApiKey, setGoogleMapsApiKey] = useState<string | undefined>()
    const params = useParams<{query:string}>();
    const { data: session, status } = useSession();

    const searchPosts = async () => {
        const gmk = await getEnv('GOOGLE_MAPS');
        setGoogleMapsApiKey(gmk);

        const posts = await getPosts(params.query.toString())
        if (!posts) return

        setRenderKey(prev => prev + 1)
        setPosts(posts);
    }

    const getCurrentUser = async () => {
        const currUser = await currentUser()
        if (!currUser) return

        setUser(currUser);
    }

    useEffect(() => {
        if (status === 'authenticated') {
            getCurrentUser()
            searchPosts()
        }      
    },[session])

	return (
		<>
            {googleMapsApiKey &&
                <APIProvider apiKey={googleMapsApiKey || ''}>
                    {user && 
                        posts &&
                        <div className="flex flex-col gap-5 py-3">
                            <div className='bg-white rounded-md text-2xl font-bold px-3 py-3 flex justify-center'>
                                {params.query.toString()}
                            </div>
                            {
                                (user && posts && posts.length) &&
                                    posts.map((post:Post, index:number) => {
                                        return (
                                            <PostUi key={`${post.id}-${renderKey}-${index}`} postData={post} user={user} googleMapsApiKey={googleMapsApiKey} />
                                        )
                                    })
                                }
                        </div>
                    }
                </APIProvider>
            }
		</>
	);
}
