'use client'

import { useForm,Controller } from "react-hook-form";
import * as z from 'zod'
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef, useState } from "react";
import RTEditor from "../shared/Fields/RichTextEditor/RTEditor";
import PostFormActions from '@/components/shared/PostUi/PostFormActions'
import { InitialEditorStateType } from "lexical";

interface Props {
    savePost:Function,
    userId?: string,
    postType?: string,
    edited?: boolean,
    parentPostId?:string,
    content?:InitialEditorStateType,
    postId?:string
}

const PostValidation = z.object({
    userId: z.string(),
    postType: z.string(),
    edited: z.boolean(),
    parentPostId: z.string().optional(),
    content: z.any(),
    lexical: z.string().optional(),
    postId: z.string().optional()
    // postFile: z.string(), 
    // privatePost: z.boolean(), 
})

const PostForm = ({userId, postType, edited, postId, parentPostId, savePost, content}: Props) => {
    const [clearEditor, setClearEditor] = useState(false);
    const editorRef: any = useRef(null);

    const { register, handleSubmit, control, reset, formState: { errors, isSubmitSuccessful } } = useForm<z.infer<typeof PostValidation>>({
        resolver: zodResolver(PostValidation),
        defaultValues: {
            userId,
            postType,
            edited,
            parentPostId,
            postId,
            content: ""
        }
    })

    const onSubmit = async (values: z.infer<typeof PostValidation>) => {
        if (postId) {
            values.postId = postId;
        }

        if (parentPostId) {
            values.parentPostId = parentPostId;
        }

        if (values.content && values.content.html && values.content.lexical) {
            const {html, lexical} = values.content;
            values.content = html;
            values.lexical = JSON.stringify(lexical);
        }

        await savePost(values);
        dispatchEvent(new Event('postsUpdated'));
        // const textarea = document.querySelector('.contentEditable') as HTMLDivElement;
        setClearEditor(true)
        // if (textarea) textarea?.innerHTML = '';
    }

    useEffect(() => {
        if (isSubmitSuccessful) {
            reset();
        }
    }, [isSubmitSuccessful, reset, errors]);

    const handleEditorUpdated = () => {
        setClearEditor(false);
    }

    useEffect(() => {
        window.addEventListener('editorUpdated', handleEditorUpdated);

        return () => {
            window.removeEventListener('editorUpdated', handleEditorUpdated);
        }
    }, [])

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
			<div className="mb-10">
                <Controller
                    control={control}
                    name='content'
                    render={({ field }) => (
                        <RTEditor ref={editorRef} onChange={field.onChange} clearEditor={clearEditor} content={content}/>
                    )}
                />
				{/* <textarea
					className="border border-gray-400 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:border-indigo-500 h-30"
					id="content"
					{...register('content', { required: true })}
                    onChange={checkText}
				/> */}

                <PostFormActions/>
            </div>
        </form>
    )
}

export default PostForm