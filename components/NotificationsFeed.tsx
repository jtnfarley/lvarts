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
        <div className='flex flex-col gap-5 bg-white rounded-box'>
            {
				(user && notis && notis.length) &&
                	notis.map((noti:Notification, index:number) => {
						return (
							<div key={index} className={`noti-link flex items-center text-md p-2 border-gray-300 rounded-lg ${(noti.read) ? 'bg-gray-100' : 'bg-green-400/20'}`}>
								<Link href={`/user/${noti.handle}`}>
									<img src={(noti.userdir && noti.avatar) ? `${imageUrl}/${noti.userdir}/${noti.avatar}` : '/images/melty-man.png'} alt={`${noti.displayname || noti.handle || 'Notification'} avatar`} className='avatar me-2 w-[50px] h-[50px]'/>
								</Link>
								<Link href={`/user/${noti.handle}`} className='me-1'>
									{noti.displayname}
								</Link>

								{(noti.notificationtype === 'comment') ? <span> commented on <Link href={`/post/${noti.postid}`}>your post</Link></span> : 
									(noti.notificationtype === 'like') ? <span> liked <Link href={`/post/${noti.postid}`}>your post</Link></span> :
									(noti.notificationtype === 'mention') ? <span> mentioned you in <Link href={`/post/${noti.postid}`}>a post</Link></span> :
									' followed you' 
								}
							</div>
						)
					})
				}
        </div>
    )
}
