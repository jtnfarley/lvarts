import { useEffect, useState } from 'react';
import Post from '@/lib/models/post';
import User from '@/lib/models/user';
import { getComments } from '@/app/actions/posts';
import PostUi from '../PostUi/PostUi';

export default function CommentFeed(props:{parentPostId:string, user:User}) {
    const {parentPostId, user} = props;
    const [feed, setFeed] = useState<Array<Post>>();
    const [renderKey, setRenderKey] = useState(0)

    const getCommentsFeed = async () => {
        const feedArr = await getComments(parentPostId);
        setFeed(feedArr);
        setRenderKey(prev => prev + 1);
    }

    useEffect(() => {
        window.addEventListener('postsUpdated', getCommentsFeed)
        getCommentsFeed();
        
        return () => {
            window.removeEventListener('postsUpdated', getCommentsFeed)
        }
    }, [])

    return (
        <div className="flex flex-col gap-5">
            {
                (feed && feed.length) ?
                    feed.map((post:Post, index:number) => {
                        return (
                            <PostUi key={`${post.id}-${renderKey}-${index}`} postData={post} user={props.user} />
                        )
                    })
                    :
                    <div>No comments yet</div>
            }
        </div>
    )
}