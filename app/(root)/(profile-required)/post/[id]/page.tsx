import Link from 'next/link';
import AddPostForm from "@/components/forms/AddPostForm"
import CommentFeed from "@/components/Comments/CommentFeed";
import SinglePost from '@/components/SinglePost';
import { redirect } from 'next/navigation';
import {currentUser} from "@/app/data/currentUser";
import { getPost, getCommentFeedRow, savePost } from "@/app/data/posts";
import type { FeedRow } from '@/lib/models/initFeedRow';

export default async function SinglePostPage({
  params,
}: {
  params: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const user = await currentUser();

    const { id } = await params;
    const postId = typeof id === 'string' ? Number.parseInt(id, 10) : NaN;

    const googleMapsApiKey = process.env.GOOGLE_MAPS;

    let post: FeedRow | null = null;
    let comments: FeedRow[] = [];

    if (!Number.isNaN(postId)) {
        post = await getPost(postId);
        comments = await getCommentFeedRow(postId);
    }

    if (!post) return redirect('/home');

	return (
        <>
        {(user) ?
            (post && !Number.isNaN(postId) && googleMapsApiKey) &&           
                <div className='flex flex-col'>
                    <div className='mb-4'>
                        <SinglePost post={post} user={user} googleMapsApiKey={googleMapsApiKey} />
                    </div>
                    <div className='mt-2'>
                        <AddPostForm user={user} posttype='comment' edited={false} parentPostId={postId} savePost={savePost}/>
                    </div>
                    <div>
                        <CommentFeed comments={comments} parentPostId={postId.toString()} user={user} getNewComments={getCommentFeedRow} getOldComments={getCommentFeedRow} googleMapsApiKey={googleMapsApiKey}/>
                    </div>
                </div>
                :
                <div className='rounded-box'>
                    <Link href={'/'} className='text-primary'>Log in to view full post</Link>
                </div>      
            }
        </>
	);
}
