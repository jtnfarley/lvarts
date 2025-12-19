'use client'

import Post from '@/lib/models/post';
import User from '@/lib/models/user';
import Notification from '@/lib/models/notification';
import { useEffect, useState } from 'react';
import { getNotifications, updateNotis } from '@/app/actions/notifications';
import Link from 'next/link';
import imageUrl from '@/constants/imageUrl';

export default function NotificationsFeed(props:{user:User, getUser:Function}) {
	const [notis, setNotis] = useState<Array<Notification>>();
	const [renderKey, setRenderKey] = useState(0);
	const [user, setUser] = useState<User|null>();

	let updating = false, 
	lastChecked:Date | undefined;

	const getFeedArr = async (user:User):Promise<Array<Notification> | undefined> => {
		const notis = await getNotifications(user!);
		console.log(notis)
        return notis;
    }

	const handlePostsUpdated = async () => {
		if (updating) return //in case postsUpdated and the interval collide
		updating = true

		const userfromServer = await props.getUser()
		setUser(userfromServer)
		
		const feedArr = await getFeedArr(userfromServer);
		lastChecked = new Date();

		setNotis(feedArr)
		setRenderKey(prev => prev + 1)
		updating = false
	}

	useEffect(() => {
		handlePostsUpdated()
		// const feedInterval = setInterval(() => {
		// 	handlePostsUpdated()
		// }, 60000)
	}, [])

	useEffect(() => {
		return () => {
			updateNotis(notis);
		}
	})

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
        <div className='flex-col gap-10'>
            {
				(user && notis && notis.length) &&
                	notis.map((noti:Notification, index:number) => {
						return (
							<div key={index} className={`noti-link flex items-center center-box ${(noti.read) ? 'bg-gray-200' : ''}`}>
								<Link href={`/user/${noti.notiUser?.id}`}>
									<img src={(noti.notiUserDetails?.userDir && noti.notiUserDetails?.avatar) ? `${imageUrl}/${noti.notiUserDetails?.userDir}/${noti.notiUserDetails?.avatar}` : '/images/melty-man.png'} alt={`${noti.notiUserDetails?.displayName} avatar`} className='avatar me-2'/>
								</Link>
								<Link href={`/user/${noti.notiUser?.id}`} className='me-1'>
									{noti.notiUserDetails?.displayName}
								</Link>

								{(noti.type === 'comment') ? <span> commented on <Link href={`/post/${noti.post?.id}`}>your post</Link></span> : 
									(noti.type === 'like') ? <span> liked <Link href={`/post/${noti.post?.id}`}>your post</Link></span> : ' followed you' 
								}
							</div>
						)
					})
				}
        </div>
    )
}