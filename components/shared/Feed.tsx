'use client'

import Post from '@/lib/models/post';
import User from '@/lib/models/user';
import { useEffect, useState } from 'react';
import PostUi from './PostUi/PostUi';
import { getFeed } from '@/app/actions/posts';

export default function Feed(props:{user:User, getUser:Function}) {
	const [feed, setFeed] = useState<Array<Post>>();
	const [renderKey, setRenderKey] = useState(0);
	const [user, setUser] = useState<User|null>();

	let updating = false, tempFeed:Post[] | undefined, 
	lastChecked:Date;

	const getFeedArr = async (user:User):Promise<Array<Post> | undefined> => {
        return await getFeed(user!, lastChecked)
    }

	const handlePostsUpdated = async () => {
		if (updating) return //in case postsUpdated and the interval collide
		updating = true
		const userfromServer = await props.getUser()
		setUser(userfromServer)
		const feedArr = await getFeedArr(userfromServer);
		lastChecked = new Date();
		const newFeed = (feedArr && feedArr.length && tempFeed && tempFeed.length) ? [...feedArr, ...tempFeed] : (feedArr && feedArr.length) ? feedArr : tempFeed;
		setFeed(newFeed)
		tempFeed = newFeed
		setRenderKey(prev => prev + 1)
		updating = false
	}



	useEffect(() => {
		window.addEventListener("postsUpdated", handlePostsUpdated)

		handlePostsUpdated()

		const feedInterval = setInterval(() => {
			handlePostsUpdated()
		}, 60000)

		return () => {
			window.removeEventListener("postsUpdated", handlePostsUpdated)
			clearInterval(feedInterval)
		}
	}, [])

	// useEffect(() => {
        

	// 	handlePostsUpdated()
	// 	// const init = async () => {
	// 	// 	const feedArr = await getFeedArr()
	// 	// 	if (!feedArr) return
			
	// 	// 	setFeed(feedArr)
	// 	// }

	// 	// init();

	// }, [,props.user])

    return (
        <div className="flex flex-col gap-5 pb-5">
            {
				(user && feed && feed.length) &&
                	feed.map((post:Post, index:number) => {
						return (
							<PostUi key={`${post.id}-${renderKey}-${index}`} postData={post} user={user} />
						)
					})
				}
        </div>
    )
}