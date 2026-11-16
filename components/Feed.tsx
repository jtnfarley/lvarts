'use client'

import {APIProvider} from '@vis.gl/react-google-maps';
import User from '@/lib/models/user';
import { useEffect, useRef, useState } from 'react';
import PostUi from './PostUi/PostUi';
import { LoadOldPosts } from './PostUi/LoadOldPosts';
import { BiRefresh } from "react-icons/bi";
import { FeedRow } from '@/lib/models/initFeedRow';
import Link from 'next/link';
import { readFeedCache, writeFeedCache } from '@/lib/feedCache';

const POLL_INTERVAL_MS = 60000;

// Edit events and overlapping fetches can return posts the feed already has.
const withoutDuplicates = (posts:FeedRow[], existing:FeedRow[]) => {
	const existingIds = new Set(existing.map(post => post.id));
	return posts.filter(post => !existingIds.has(post.id));
}

export default function Feed(props:{feed:FeedRow[], fetchedAt:Date, user:User, getFeedRow:Function, googleMapsApiKey:string | undefined}) {
	const user = props.user;
	const getFeedRow = props.getFeedRow;
	const googleMapsApiKey = props.googleMapsApiKey;
	// Coming back from another page: prefer the feed we already had over the server-rendered snapshot, which may be an old cached copy.
	const [restored] = useState(() => user.userdetails ? readFeedCache(user.userdetails.id) : undefined);
	const [feed, setFeed] = useState<FeedRow[]>(restored?.feed ?? props.feed);
	const [hasQueuedPosts, setHasQueuedPosts] = useState(!!restored?.queued.length);
	const [endOfPosts, setEndOfPosts] = useState(restored?.endOfPosts ?? false);
	const [renderKey, setRenderKey] = useState(0);

	const queuedPostsRef = useRef<FeedRow[]>(restored?.queued ?? []);
	const updatingRef = useRef(false);
	const tempFeedRef = useRef<FeedRow[]>(restored?.feed ?? props.feed);
	const lastCheckedRef = useRef<Date | undefined>(restored?.lastChecked ?? props.fetchedAt);
	const endOfPostsRef = useRef(restored?.endOfPosts ?? false);

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

		const newPosts = await getFeedRow(user.userdetails, 0, lastCheckedRef.current, true);

		if (newPosts && newPosts.length) {
			// Posts waiting behind the "Load more posts" button are already past lastChecked, so keep them.
			const arrivals = withoutDuplicates([...newPosts, ...queuedPostsRef.current], tempFeedRef.current);
			queuedPostsRef.current = [];
			setHasQueuedPosts(false);
			tempFeedRef.current = [...arrivals, ...tempFeedRef.current];

			setRenderKey(prev => prev + 1)
		}

		setFeed(tempFeedRef.current);

		lastCheckedRef.current = new Date();

		updatingRef.current = false
	}

	const getNewPostsFromServer = async () => {
		const checkedAt = new Date();
		const newPosts = await getFeedRow(user.userdetails, 0, lastCheckedRef.current, true);
		lastCheckedRef.current = checkedAt;

		const arrivals = withoutDuplicates(newPosts ?? [], [...tempFeedRef.current, ...queuedPostsRef.current]);
		if (arrivals.length) {
			queuedPostsRef.current = [...arrivals, ...queuedPostsRef.current];
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
		const oldPosts = await getFeedRow(user.userdetails, feed.length, undefined, true);
	
		if (oldPosts && oldPosts.length && tempFeedRef.current && tempFeedRef.current.length) {
			tempFeedRef.current = [...tempFeedRef.current, ...withoutDuplicates(oldPosts, tempFeedRef.current)];
			setFeed(tempFeedRef.current)
		} else {
			endOfPostsRef.current = true;
			setEndOfPosts(true);
		}
	}

	useEffect(() => {
		window.addEventListener("postsUpdated", handlePostsUpdated)

		// A hidden tab doesn't need to poll; it catches up as soon as it is visible again.
		const pollIfVisible = () => {
			if (!document.hidden) getNewPostsFromServer();
		}

		// Fill the gap since the snapshot or cached feed was taken, unless it is already fresh.
		const lastChecked = lastCheckedRef.current;
		if (!lastChecked || Date.now() - lastChecked.getTime() > POLL_INTERVAL_MS) pollIfVisible();

		const feedInterval = setInterval(pollIfVisible, POLL_INTERVAL_MS)
		document.addEventListener("visibilitychange", pollIfVisible)

		return () => {
			window.removeEventListener("postsUpdated", handlePostsUpdated)
			document.removeEventListener("visibilitychange", pollIfVisible)
			clearInterval(feedInterval)

			if (user.userdetails && lastCheckedRef.current) {
				writeFeedCache({
					userdetailsId: user.userdetails.id,
					feed: tempFeedRef.current,
					queued: queuedPostsRef.current,
					lastChecked: lastCheckedRef.current,
					endOfPosts: endOfPostsRef.current,
				});
			}
		}
	}, [])

    return (
        <div className="flex flex-col gap-5 pb-5">
			<APIProvider apiKey={googleMapsApiKey || ''}>
				{
					(hasQueuedPosts) &&
						<div className='flex justify-center'>
							<button onClick={loadNewPosts} className='flex items-center gap-2 rounded-full bg-lvartsmusic-card px-4 py-1.5 text-sm text-lvartsmusic-foreground hover:bg-black/5 dark:hover:bg-white/10'>
								<div className='text-xl'><BiRefresh /></div>
								Load more posts
							</button>
						</div>
				}
            {
				(user && feed && feed.length) ?
				<>
                	{feed.map((post:FeedRow, index:number) => {
						return (
							<PostUi key={`${post.id}-${renderKey}-${index}`} postData={post} user={user} googleMapsApiKey={googleMapsApiKey} trackImpressions />
						)
					})}
					<LoadOldPosts getOldPosts={getOldPostsFromServer} endOfPosts={endOfPosts}/>
				</>
				:
				<div className='lvartsmusic-card p-4 text-lvartsmusic-muted'>It's quiet. <em>Too quiet.</em> Follow some folks, like <Link href='/user/atown_clown' className='text-lvartsmusic-accent'>this clown</Link>, to get in on the action.</div>
			}
			</APIProvider>
        </div>
    )
}
