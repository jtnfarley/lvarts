'use client'

import { useEffect, useRef, useState } from 'react';
import Post from '@/lib/models/post';
import User from '@/lib/models/user';
import PostUi from '../PostUi/PostUi';
import { LoadOldPosts } from '../PostUi/LoadOldPosts';

export default function CommentFeed(props:{comments:Post[], parentPostId:string, user:User, getNewComments:Function, getOldComments:Function, googleMapsApiKey:string | undefined}) {
    const {parentPostId, user, getNewComments, getOldComments, googleMapsApiKey} = props;
    const [feed, setFeed] = useState<Array<Post>>(props.comments);
    const tempFeedRef = useRef<Post[]>(props.comments);
    const [renderKey, setRenderKey] = useState(0)
    const [endOfPosts, setEndOfPosts] = useState(false);
    const lastCheckedRef = useRef<Date | undefined>(new Date());

    const getNewCommentsFromServer = async (ev?:Event) => {
        if (ev && ev instanceof CustomEvent && ev.detail) {
			if (ev.detail.action && ev.detail.action === 'delete') {
				tempFeedRef.current = tempFeedRef.current.filter(post => post.id !== ev.detail.postId)
			}

			if (ev.detail.action && ev.detail.action === 'edit') {
				tempFeedRef.current = []
				lastCheckedRef.current = undefined
			}
		}

        const newComments = await getNewComments(parentPostId, lastCheckedRef.current);

        if (newComments && newComments.length) {
			if (tempFeedRef.current && tempFeedRef.current.length) {
				tempFeedRef.current = [...newComments, ...tempFeedRef.current];
			} else {
				tempFeedRef.current = newComments;
			}
		}

        setFeed(tempFeedRef.current);
        setRenderKey(prev => prev + 1);
        lastCheckedRef.current = new Date();
    }

    const getOldCommentsFromServer = async () => {
        const oldComments = await getOldComments(parentPostId, tempFeedRef.current.length);

        if (oldComments && oldComments.length) {
			if (tempFeedRef.current && tempFeedRef.current.length) {
				tempFeedRef.current = [...tempFeedRef.current, ...oldComments];
			}
		} else {
			setEndOfPosts(true);
		}

        setFeed(tempFeedRef.current);
        setRenderKey(prev => prev + 1);
    }

    useEffect(() => {
        window.addEventListener('postsUpdated', getNewCommentsFromServer)
        
        return () => {
            window.removeEventListener('postsUpdated', getNewCommentsFromServer)
        }
    }, [])

    return (
        <div className="flex flex-col gap-5">
            {
                (feed && feed.length) ?
                    <>
                        {feed.map((post:Post, index:number) => {
                            return (
                                <PostUi key={`${post.id}-${renderKey}-${index}`} postData={post} user={user} googleMapsApiKey={googleMapsApiKey} />
                            )
                        })}
                        <LoadOldPosts getOldPosts={getOldCommentsFromServer} endOfPosts={endOfPosts} />
                    </>
                    :
                    <div className='bg-white rounded-lg px-3 py-3'>No comments yet</div>
            }
        </div>
    )
}