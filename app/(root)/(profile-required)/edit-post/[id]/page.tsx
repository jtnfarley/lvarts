import EditPostForm from "@/components/forms/EditPostForm"
import { redirect } from 'next/navigation';
import { prisma } from '@/prisma';
import {currentUser} from "@/app/data/currentUser";
import { revalidatePath } from "next/cache";
import { getPostTypeLabel } from "@/lib/utils";
import { notifyMentionedUsers } from "@/app/data/postMentions";
import { savePost, getPost } from "@/app/data/posts";
import { canModifyPost } from "@/lib/auth/canModifyPost";
import { isAdmin } from "@/lib/auth/isAdmin";

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

    // Same rule savePost enforces: only the author (first usertoposts row) or an admin may edit.
    const author = await prisma.usertoposts.findFirst({
        where: { postid: postId },
        orderBy: { id: 'asc' },
        select: { userdetailsid: true },
    });
    const allowed = canModifyPost({
        authorUserdetailsId: author?.userdetailsid,
        userdetailsid: user.userdetails?.id,
        isAdmin: await isAdmin(),
    });
    if (!allowed) return redirect('/home');

	return (
        <div>
            <div className="flex flex-row justify-center mb-5">
                <div className="text-xl">Edit {getPostTypeLabel(post.posttype)}</div>
            </div>

            <div className="lvartsmusic-card">
            {
                (post && id) &&           
                    <div className='flex flex-col'>
                        <div className='mt-2'>
                            <EditPostForm post={post} user={user} savePost={savePost}/>
                        </div>
                    </div>   
                }
            </div>
        </div>
	);
}
