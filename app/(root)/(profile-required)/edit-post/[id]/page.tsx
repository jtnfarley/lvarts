import EditPostForm from "@/components/forms/EditPostForm"
import { redirect } from 'next/navigation';
import { prisma } from '@/prisma';
import {currentUser} from "@/app/data/currentUser";
import { revalidatePath } from "next/cache";
import { getPostTypeLabel } from "@/lib/scenePosts";
import { notifyMentionedUsers } from "@/app/data/postMentions";
import { savePost, getPost } from "@/app/data/posts";

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const user = await currentUser();

    const { id } = await params;
    const postId = typeof id === 'string' ? Number.parseInt(id, 10) : NaN;

    let post;
    
    if (!Number.isNaN(postId) && user.userdetails?.id) {
        post = await getPost(postId);
    }

    if (!post) return redirect('/home');    

	return (
        <div>
            <div className="flex flex-row justify-center mb-5">
                <div className="text-xl">Edit {getPostTypeLabel(post.posttype)}</div>
            </div>

            <div className="lvartsmusic-card">
            {
                (post && id) &&           
                    <div className='py-5 flex flex-col'>
                        <div className='mt-2'>
                            <EditPostForm post={post} user={user} savePost={savePost}/>
                        </div>
                    </div>   
                }
            </div>
        </div>
	);
}
