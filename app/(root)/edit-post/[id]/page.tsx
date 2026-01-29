import EditPostForm from "@/components/forms/EditPostForm"
import { redirect } from 'next/navigation';
import { prisma } from '@/prisma';
import {currentUser} from "@/app/data/currentUser";
import { revalidatePath } from "next/cache";
import EditEventPostForm from "@/components/forms/EditEventPostForm";

const getPost = async (postId:string, userId:string):Promise<any> => {
    const post = await prisma.posts.findFirst({
        where: {
            id: postId,
            userId // make sure the postId is owned by the current user 
        },
        include: {
            user:true,
            userDetails: true,
            parentPost: {
                include: {
                    userDetails: true
                }
            }
        }
    })

    return post;
}

const editPost = async (postData:any) => {
    'use server'

    const {content, lexical, postId, eventTitle, eventDate, postFile, postFileType} = postData
    const date = new Date()
    const updatedAt = date

    const post = await prisma.posts.update({
        where: {
            id: postId
        },
        data: {
            content,
            lexical: lexical ?? null,
            edited: true,
            postFile: postFile ?? null,
            // privatePost: privatePost ?? null,
            updatedAt,
            eventTitle,
            eventDate,
            ...(postFileType !== undefined ? { postFileType } : {})
        }
    })

    return post;
}

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const user = await currentUser();

    const { id } = await params;

    let post;
    
    if (id) {
        post = await getPost(id.toString(), user.id);
    }

    if (!post) return redirect('/home');    

	return (
        <div className="mt-5">
            <div className="rounded-box flex flex-row justify-center">
                <div className="text-xl">Edit 
                    {
                            post.postType === 'event' ?
                            ' Event'
                            :
                            ' Post'
                    }</div>
            </div>
        {
            (post && id) &&           
                <div className='py-5 flex flex-col'>
                    <div className='mt-2'>
                        {
                            post.postType === 'event' ?
                                <EditEventPostForm post={post} user={user} savePost={editPost} />
                                :
                                <EditPostForm post={post} user={user} savePost={editPost}/>
                        }
                    </div>
                </div>   
            }
        </div>
	);
}
