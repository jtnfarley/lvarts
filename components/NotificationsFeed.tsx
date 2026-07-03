'use client'

import User from '@/lib/models/user';
import Notification from '@/lib/models/notification';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import imageUrl from '@/constants/imageUrl';
import Avatar from '@/components/shared/Avatar';

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
							<div key={index} className={`flex items-center text-md p-2 lvartsmusic-card ${(!noti.read) ? 'bg-green-400/20' : ''}`}>
								<Link href={`/user/${noti.handle}`} className='link'>
									<Avatar
										imageUrl={(noti.userdir && noti.avatar) ? `${imageUrl}/${noti.userdir}/${noti.avatar}` : undefined}
										displayName={noti.displayname}
										handle={noti.handle}
										size='md'
										className='me-2'
									/>
								</Link>
								<Link href={`/user/${noti.handle}`} className='me-1 link'>
									{noti.displayname}
								</Link>

								{(noti.notificationtype === 'comment') ? <span> commented on <Link href={`/post/${noti.postid}`} className='link'>your post</Link></span> : 
									(noti.notificationtype === 'like') ? <span> liked <Link href={`/post/${noti.postid}`} className='link'>your post</Link></span> :
									(noti.notificationtype === 'mention') ? <span> mentioned you in <Link href={`/post/${noti.postid}`} className='link'>a post</Link></span> :
									' followed you' 
								}
							</div>
						)
					})
				}
        </div>
    )
}
