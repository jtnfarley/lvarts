'use client'

import { useForm } from "react-hook-form";
import * as z from 'zod'
import { zodResolver } from "@hookform/resolvers/zod";
import { savePost } from "@/app/actions/posts";
import { useEffect } from "react";
import PostFormActions from '@/components/shared/PostUi/PostFormActions'

interface Props {
    userId: string,
    postType: string,
    edited: boolean
}

const PostValidation = z.object({
    content: z.string().min(3, {
        message: 'Minimum 3 characters.'
    }).max(1000),
    userId: z.string(),
    postType: z.string(),
    edited: z.boolean(),
    // postFile: z.string(), 
    // privatePost: z.boolean(), 
    // parentPostId: z.string()
})

const AddPostForm = ({userId, postType, edited}: Props) => {
    const { register, handleSubmit, reset, formState: { isSubmitSuccessful } } = useForm<z.infer<typeof PostValidation>>({
        resolver: zodResolver(PostValidation),
        defaultValues: {
            content: '',
            userId,
            postType,
            edited
        }
    })

    const onSubmit = async (values: z.infer<typeof PostValidation>) => {
        await savePost(values)
        dispatchEvent(new Event('postsUpdated'))
        const textarea:HTMLTextAreaElement = document.getElementsByName('content')[0] as HTMLTextAreaElement
        textarea.value = ''
    }

    useEffect(() => {
        if (isSubmitSuccessful) {
            reset();
        }
    }, [isSubmitSuccessful, reset]);

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
			<div className="mb-4">
				<label className="block text-gray-700 font-medium mb-2" htmlFor="name">
					Scream it into the ether
				</label>
				<textarea
					className="border border-gray-400 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:border-indigo-500 h-30"
					id="content"
					{...register('content', { required: true })}
				/>

                <PostFormActions/>
            </div>
        </form>
    )
}

export default AddPostForm