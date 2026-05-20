'use client'

import {APIProvider} from '@vis.gl/react-google-maps';
import User from '@/lib/models/user';
import { useEffect, useRef, useState } from 'react';
import PostUi from './PostUi/PostUi';
import { LoadOldPosts } from './PostUi/LoadOldPosts';
import { BiRefresh } from "react-icons/bi";
import { FeedRow } from '@/lib/models/initFeedRow';

export default function Feed(props:{feed:FeedRow[], user:User, getFeedRow:Function, googleMapsApiKey:string | undefined}) {
	const [feed, setFeed] = useState<FeedRow[]>(props.feed);
	const user = props.user;
	const getFeedRow = props.getFeedRow;
	const googleMapsApiKey = props.googleMapsApiKey;
	const [hasQueuedPosts, setHasQueuedPosts] = useState(false);
	const [endOfPosts, setEndOfPosts] = useState(false);
	const [renderKey, setRenderKey] = useState(0);

	const queuedPostsRef = useRef<FeedRow[]>([]);
	const updatingRef = useRef(false);
	const tempFeedRef = useRef<FeedRow[]>(props.feed);
	const lastCheckedRef = useRef<Date | undefined>(new Date());

	const handlePostsUpdated = async (ev?:Event) => {
		if (updatingRef.current) return //in case postsUpdated and the interval collide
		
		updatingRef.current = true

		if (ev && ev instanceof CustomEvent && ev.detail) {
			if (ev.detail.action && ev.detail.action === 'delete') {
				tempFeedRef.current = tempFeedRef.current.filter(post => post.id !== ev.detail.postid)
			}

			if (ev.detail.action && ev.detail.action === 'edit') {
				tempFeedRef.current = []
				lastCheckedRef.current = undefined
			}
		}

		const newPosts = await getFeedRow(user.userdetails, 0, lastCheckedRef.current);

		if (newPosts && newPosts.length) {
			queuedPostsRef.current = [];
			setHasQueuedPosts(false);

			if (tempFeedRef.current && tempFeedRef.current.length) {
				tempFeedRef.current = [...newPosts, ...tempFeedRef.current];
			} else {
				tempFeedRef.current = newPosts;
			}

			setRenderKey(prev => prev + 1)
		}

		setFeed(tempFeedRef.current);

		lastCheckedRef.current = new Date();

		updatingRef.current = false
	}

	const getNewPostsFromServer = async () => {
		const newPosts = await getFeedRow(user.userdetails, 0, lastCheckedRef.current);
		lastCheckedRef.current = new Date();

		if (newPosts && newPosts.length && queuedPostsRef.current && queuedPostsRef.current.length) {
			queuedPostsRef.current = [...newPosts, ...queuedPostsRef.current];
			setHasQueuedPosts(true)
		} else if (newPosts && newPosts.length) {
			queuedPostsRef.current = newPosts;
			setHasQueuedPosts(true)
		}
	}

	const loadNewPosts = () => {
		if (queuedPostsRef.current.length && tempFeedRef.current && tempFeedRef.current.length) {
			tempFeedRef.current = [...queuedPostsRef.current, ...tempFeedRef.current];
			setFeed(tempFeedRef.current);
			queuedPostsRef.current = [];
			setHasQueuedPosts(false);
			setRenderKey(prev => prev + 1)
		}
	}

	const getOldPostsFromServer = async () => {
		const oldPosts = await getFeedRow(user.userdetails, feed.length);
	
		if (oldPosts && oldPosts.length && tempFeedRef.current && tempFeedRef.current.length) {
			tempFeedRef.current = [...tempFeedRef.current, ...oldPosts];
			setFeed(tempFeedRef.current)
		} else {
			setEndOfPosts(true);
		}
	}

	useEffect(() => {
		window.addEventListener("postsUpdated", handlePostsUpdated)

		const feedInterval = setInterval(() => {
			getNewPostsFromServer();
		}, 60000)

		return () => {
			window.removeEventListener("postsUpdated", handlePostsUpdated)
			clearInterval(feedInterval)
		}
	}, [])

    return (
        <div className="flex flex-col gap-5 pb-5">
			<APIProvider apiKey={googleMapsApiKey || ''}>
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
				(user && feed && feed.length) ?
				<>
                	{feed.map((post:FeedRow, index:number) => {
						return (
							<PostUi key={`${post.id}-${renderKey}-${index}`} postData={post} user={user} googleMapsApiKey={googleMapsApiKey} />
						)
					})}
					<LoadOldPosts getOldPosts={getOldPostsFromServer} endOfPosts={endOfPosts}/>
				</>
				:
				<div className='rounded-box flex-row bg-white'>It's quiet. <em>Too quiet.</em> Follow some folks to get in on the action.</div>
			}
			</APIProvider>
        </div>
    )
}
