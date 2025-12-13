'use client'

import { useForm,Controller } from "react-hook-form";
import * as z from 'zod'
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef, useState } from "react";
import RTEditor from "../shared/Fields/RichTextEditor/RTEditor";
import PostFormActions from '@/components/shared/PostUi/PostFormActions'
import { InitialEditorStateType } from "lexical";
import uploadFile from "@/app/actions/fileUploader";
import User from "@/lib/models/user";
import ImageUpload from "@/components/shared/PostUi/ImageUpload"

interface Props {
    savePost:Function,
    user: User,
    postType?: string,
    edited?: boolean,
    parentPostId?:string,
    content?:InitialEditorStateType,
    postId?:string
}

const PostValidation = z.object({
    userId: z.string(),
    postType: z.string().optional(),
    edited: z.boolean().optional(),
    parentPostId: z.string().optional(),
    content: z.any(),
    lexical: z.string().optional(),
    postId: z.string().optional(),
    postFile: z.string().optional(),
    postFileType: z.string().optional(),
    postFileObj: z.instanceof(File).optional(),
    // privatePost: z.boolean(), 
})

const PostForm = ({user, postType, edited, postId, parentPostId, savePost, content}: Props) => {
    const [clearEditor, setClearEditor] = useState(false);
    const [tempImage, setTempImage] = useState();
    const editorRef: any = useRef(null);

    const { register, handleSubmit, setValue, control, reset, formState: { errors, isSubmitSuccessful } } = useForm<z.infer<typeof PostValidation>>({
        resolver: zodResolver(PostValidation),
        defaultValues: {
            userId: user.id,
            postType: postType ?? '',
            edited: edited ?? false,
            parentPostId: parentPostId ?? undefined,
            postId: postId ?? undefined,
            content: content ?? ""
        }
    })

    const sendFile = async (filedata:{file:File, userDir:string}) => {
        const {file, userDir} = filedata;
        await uploadFile({file, userDir});
        // setAvatarUrl(`${avatarUrlBase}/${userDir}/${file.name}`);
    }

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

        let userDir, postFileUrl;

        if (user && user.userDetails)
            userDir = user.userDetails.userDir;

        if (values.postFileObj && userDir) {
            const file = values.postFileObj;
            const formData = new FormData();
            formData.append('file', file);
            formData.append('userDir', userDir);

            sendFile({file, userDir});

            postFileUrl = file.name;
            values.postFile = postFileUrl;
            values.postFileType = file.type;
        }

        await savePost(values);
        dispatchEvent(new Event('postsUpdated'));
        // const textarea = document.querySelector('.contentEditable') as HTMLDivElement;
        setClearEditor(true);
        setTempImage(undefined);
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
                {tempImage && 
                    <img src={URL.createObjectURL(tempImage)}/>
                }

                <div className="mt-2 flex flex-row">
                    <div className="w-[50%]">
                        <ImageUpload register={register} setValue={setValue} setTempImage={setTempImage}/>
                    </div>
                    <div className="w-[50%] flex justify-end">
                        <button type='submit' className="bg-orange px-2 py-2 rounded text-white uppercase font-semibold">
                            Post
                        </button>
                    </div>
                </div>

                {/* <PostFormActions register={register} setValue={setValue} setTempImage={setTempImage}/> */}
            </div>
        </form>
    )
}

export default PostForm
