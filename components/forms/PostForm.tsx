'use client'

import { useForm,Controller } from "react-hook-form";
import * as z from 'zod'
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef, useState } from "react";
import RTEditor from "./Fields/RichTextEditor/RTEditor";
import { InitialEditorStateType } from "lexical";
import uploadFile from "@/app/actions/fileUploader";
import User from "@/lib/models/user";
import MediaUpload from "@/components/PostUi/MediaUpload"
import { compressImage } from "@/lib/utils";

interface Props {
    savePost:Function,
    user: User,
    postType?: string,
    edited?: boolean,
    parentPostId?:string,
    content?:InitialEditorStateType,
    postId?:string
}

interface OptimizedFile {
    name:string,
    type:string, 
    url:string
}

const PostValidation = z.object({
    userId: z.string(),
    postType: z.string().optional(),
    edited: z.boolean().optional(),
    parentPostId: z.string().optional(),
    content: z.any().optional(),
    lexical: z.string().optional(),
    postId: z.string().optional(),
    postFile: z.string().optional(),
    postFileType: z.string().optional(),
    postFileObj: z.any().optional(),
    // privatePost: z.boolean(), 
})

const PostForm = ({user, postType, edited, postId, parentPostId, savePost, content}: Props) => {
    const [clearEditor, setClearEditor] = useState(false);
    const [tempImage, setTempImage] = useState<OptimizedFile | undefined>();
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

        if (tempImage && userDir) {
            const res = await fetch(tempImage.url);
            const blob = await res.blob();
            const file = new File([blob], tempImage.name, {type: tempImage.type})
            const formData = new FormData();
            formData.append('file', file);
            formData.append('userDir', userDir);

            sendFile({file, userDir});

            postFileUrl = file.name;
            values.postFile = postFileUrl;
            values.postFileType = file.type;
        }

        await savePost(values);
        if (postId) {
            dispatchEvent(new CustomEvent("postsUpdated", {
				detail: {
					action: `edit`,
					postId
				}
			}));
        } else {
            dispatchEvent(new Event('postsUpdated'));
        }

        setClearEditor(true);
        setTempImage(undefined);
    }

    const setTempFile = async (file:File) => {
        if (file) {
            const fileObj:OptimizedFile = {
                name: '',
                type:'',
                url:''
            };

            let fileUrl;

            if (file.type.match(/image/)) {
                fileUrl = await compressImage(file);
                fileObj.type = 'image/png';
                fileObj.name = file.name.split('.')[0] +'.png';
            } else if (file.type.match(/audio/)){
                fileUrl = URL.createObjectURL(file);
                fileObj.type = file.type;
                fileObj.name = file.name;
            }

            fileObj.url = fileUrl || '';

            setTempImage(fileObj);
        }
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
                {tempImage && (
                    <div className="flex justify-center">
                        { (tempImage.type.match(/audio/)) ?
                            <audio src={tempImage.url} controls/>
                            :
                            <img src={tempImage.url}/>
                        }
                    </div>
                )
                }

                <div className="mt-2 flex flex-row">
                    <div className="w-[50%]">
                        <MediaUpload register={register} setValue={setValue} setTempImage={setTempFile}/>
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
