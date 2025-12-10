'use client'

import { editPost } from "@/app/actions/posts";
import PostForm from "./PostForm";

interface Props {
    content:{},
    postId:string
}

const EditPostForm = ({content, postId}: Props) => {

    return (
        <PostForm content={content} postId={postId} savePost={editPost} userId={''} postType={''} edited={true} parentPostId={''} />
    )
}

export default EditPostForm

// 'use client'

// import { useForm } from "react-hook-form";
// import * as z from 'zod'
// import { zodResolver } from "@hookform/resolvers/zod";
// import { editPost } from "@/app/actions/posts";
// import { useEffect } from "react";
// import PostFormActions from '@/components/shared/PostUi/PostFormActions'

// interface Props {
//     content:string,
//     postId: string,
//     // postType: string
// }

// const PostValidation = z.object({
//     content: z.string().min(3, {
//         message: 'Minimum 3 characters.'
//     }).max(1000),
//     postId: z.string(),
//     // postType: z.string(),
//     // postFile: z.string(), 
//     // privatePost: z.boolean(), 
//     // parentPostId: z.string()
// })

// export default function EditPostForm({
//     content, 
//     postId
//     // postType, 
//     // edited
// }: Props) {
//     const { register, handleSubmit, reset, formState: { isSubmitSuccessful } } = useForm<z.infer<typeof PostValidation>>({
//         resolver: zodResolver(PostValidation),
//         defaultValues: {
//             content: content,
//             postId: postId,
//             // userId,
//             // postType,
//             // edited
//         }
//     })

//     const onSubmit = async (values: z.infer<typeof PostValidation>) => {
//         await editPost(values)
//         dispatchEvent(new Event('postsUpdated'))
//         // const textarea:HTMLTextAreaElement = document.getElementsByName('content')[0] as HTMLTextAreaElement
//         // textarea.value = ''
//     }

//     useEffect(() => {
//         if (isSubmitSuccessful) {
//             reset();
//         }
//     }, [isSubmitSuccessful, reset]);

//     return (
//         <form onSubmit={handleSubmit(onSubmit)}>
// 			<div className="mb-4">
// 				<textarea
// 					className="border border-gray-400 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:border-indigo-500 h-30"
// 					id="content"
// 					{...register('content', { required: true })}
// 				/>

//                 <PostFormActions/>
//             </div>
//         </form>
//     )
// }