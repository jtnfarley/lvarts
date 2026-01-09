'use client'

import {APIProvider} from '@vis.gl/react-google-maps';
import Post from '@/lib/models/post';
import User from '@/lib/models/user';
import { useEffect, useRef, useState } from 'react';
import PostUi from './PostUi/PostUi';
import { getFeed } from '@/app/actions/posts';
import { LoadOldPosts } from './PostUi/LoadOldPosts';
import { BiRefresh } from "react-icons/bi";

export default function Feed(props:{user:User, getUser:Function, googleMapsApiKey:string | undefined}) {
	const [feed, setFeed] = useState<Array<Post>>();
	const [renderKey, setRenderKey] = useState(0);
	const [user, setUser] = useState<User|null>();
	const [hasQueuedPosts, setHasQueuedPosts] = useState(false);
	const [endOfPosts, setEndOfPosts] = useState(false);

	const queuedPostsRef = useRef<Post[]>([]);
	const updatingRef = useRef(false);
	const tempFeedRef = useRef<Post[] | undefined>(undefined);
	const lastCheckedRef = useRef<Date | undefined>(undefined);
	const lastSkip = useRef<number>(0);

	const getFeedArr = async (user:User, skip?:number):Promise<Array<Post> | undefined> => {
        return await getFeed(user!, skip, lastCheckedRef.current)
    }

	const handlePostsUpdated = async (ev?:Event) => {
		if (updatingRef.current) return //in case postsUpdated and the interval collide
		updatingRef.current = true

		if (ev && ev instanceof CustomEvent && ev.detail) {
			tempFeedRef.current = undefined;
			lastCheckedRef.current = undefined;
		}

		const userfromServer = await props.getUser()
		setUser(userfromServer)
		
		const feedArr = await getFeedArr(userfromServer);
		lastCheckedRef.current = new Date();

		const tempFeed = tempFeedRef.current;
		const newFeed = (feedArr && feedArr.length && tempFeed && tempFeed.length) ? [...feedArr, ...tempFeed] : (feedArr && feedArr.length) ? feedArr : tempFeed;

		if (newFeed && newFeed.length) {
			setFeed(newFeed)
			lastSkip.current = newFeed.length;
			tempFeedRef.current = newFeed
			setRenderKey(prev => prev + 1)
		}
		updatingRef.current = false
	}

	const getNewPosts = async () => {
		const userfromServer = await props.getUser()
		setUser(userfromServer)
		
		const feedArr = await getFeedArr(userfromServer);
		lastCheckedRef.current = new Date();
console.log(feedArr)
		if (feedArr && feedArr.length) {
			queuedPostsRef.current = [...feedArr, ...queuedPostsRef.current]
			setHasQueuedPosts(true)
		}
	}

	const loadNewPosts = () => {
		if (queuedPostsRef.current.length && feed) {
			setFeed([...queuedPostsRef.current, ...feed])
			queuedPostsRef.current = [];
			setHasQueuedPosts(false)
		}
	}

	const getOldPosts = async () => {
		const userfromServer = await props.getUser()
		setUser(userfromServer)
		
		const feedArr = await getFeedArr(userfromServer, lastSkip.current);
	
		if (feedArr && feedArr.length && feed && feed.length) {
			const feedJoined = [...feed, ...feedArr];
			setFeed(feedJoined)
			setHasQueuedPosts(true);
			lastSkip.current = feedJoined.length;
		} else {
			setEndOfPosts(true);
		}
	}

	useEffect(() => {
		window.addEventListener("postsUpdated", handlePostsUpdated)

		handlePostsUpdated()

		const feedInterval = setInterval(() => {
			getNewPosts();
		}, 60000)

		return () => {
			window.removeEventListener("postsUpdated", handlePostsUpdated)
			clearInterval(feedInterval)
		}
	}, [])

    return (
        <div className="flex flex-col gap-5 pb-5">
			<APIProvider apiKey={props.googleMapsApiKey || ''}>
				{
					(hasQueuedPosts) && 
						<div className='flex justify-center'>
							<button onClick={loadNewPosts} className='bg-white/25 rounded-full px-3 py-1 text-white flex items-center gap-2'>
								<div className='text-xl'><BiRefresh color='white' /></div> 
								Load more posts
							</button>
						</div>
				}
            {
				(user && feed && feed.length) &&
				<>
                	{feed.map((post:Post, index:number) => {
						return (
							<PostUi key={`${post.id}-${renderKey}-${index}`} postData={post} user={user} googleMapsApiKey={props.googleMapsApiKey} />
						)
					})}
					<LoadOldPosts getOldPosts={getOldPosts} endOfPosts={endOfPosts}/>
				</>
			}
			</APIProvider>
        </div>
    )
}
