'use client'

import User from '@/lib/models/user';
import Notification from '@/lib/models/notification';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import imageUrl from '@/constants/imageUrl';

export default function NotificationsFeed(props:{user:User, notis:Notification[], updateNotis:Function}) {
	const { user, updateNotis } = props;
	const [notis, setNotis] = useState<Array<Notification>>(props.notis);

	useEffect(() => {
		return () => {
			updateNotis(notis);
		}
	})

    return (
        <div className='flex flex-col gap-5'>
            {
				(user && notis && notis.length) &&
                	notis.map((noti:Notification, index:number) => {
						return (
							<div key={index} className={`noti-link flex items-center text-md p-2 border-gray-400 rounded-lg ${(noti.read) ? 'bg-gray-200' : ''}`}>
								<Link href={`/user/${noti.notiUser?.id}`}>
									<img src={(noti.notiUserDetails?.userDir && noti.notiUserDetails?.avatar) ? `${imageUrl}/${noti.notiUserDetails?.userDir}/${noti.notiUserDetails?.avatar}` : '/images/melty-man.png'} alt={`${noti.notiUserDetails?.displayName} avatar`} className='avatar me-2 w-[30px] h-[30px]'/>
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