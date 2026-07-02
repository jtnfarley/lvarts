'use client'

import { useFieldArray, useForm, Controller } from "react-hook-form";
import { Button } from '@/components/ui/button';
import * as z from 'zod';
import { zodResolver } from "@hookform/resolvers/zod";
import User from "@/lib/models/user";
import { BiImageAdd } from "react-icons/bi";
import { useEffect, useRef, useState } from "react";
import { BiPlus, BiRefresh, BiX } from "react-icons/bi";
import { uploadViaWorker } from "@/lib/clientUpload";
import { getRandomString } from "@/lib/utils";
import { getHandleSuggestion } from "@/app/actions/handles";
import imageUrl from '@/constants/imageUrl';
import { compressImage } from "@/lib/utils";
import { HANDLE_REGEX, normalizeHandle } from "@/lib/handles";
import OptimizedFile from "@/lib/models/optimizedFile";
import type { UpdateUserParams } from "@/app/data/user";
import type UserDetails from "@/lib/models/userDetails";
import { Spinner } from "../layout/Spinner"
import RTEditor from "./Fields/RichTextEditor/RTEditor";
import SidebarProfile from "@/lib/models/sidebarProfile";


const MAX_UPLOAD_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const UserValidation = z.object({
    handle: z.string().min(1).max(30).regex(HANDLE_REGEX, 'Use lowercase letters, numbers, or underscores.'),
    displayname: z.string().min(1).max(100),
    bio: z.any().optional(),
    avatar: z.any().optional(),   
    urls: z.array(z.object({ urlname: z.string(), url: z.string() })).optional(), 
})

const AccountInfo = (props:{userdetails: SidebarProfile, saveUser:(user: UpdateUserParams) => Promise<UserDetails>}) => {
    const [userdetails, setUserDetails] = useState<SidebarProfile>(props.userdetails);
    const saveUser = props.saveUser;

    if (!userdetails) {
        return (
            <h1 className="text-2xl font-bold text-light-1">You shall not pass!</h1>
        )
    }

    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [isGeneratingHandle, setIsGeneratingHandle] = useState<boolean>(false);
    const [handleError, setHandleError] = useState<string | null>(null);
    const [tempImage, setTempImage] = useState<OptimizedFile | undefined>();
    const avatarUrlBase = imageUrl;
    const avatarUrlInit = userdetails && userdetails.avatar && userdetails.userdir ? `${avatarUrlBase}/${userdetails.userdir}/${userdetails.avatar}` : undefined

    const [userOnboarded, setUserOnboarded] = useState(userdetails && userdetails.displayname && userdetails.displayname !== '')
    const [avatarUrl, setAvatarUrl] = useState<string | undefined>(avatarUrlInit);
    const hasPermanentHandle = Boolean(userdetails?.handle);
    const editorRef: any = useRef(null);
    const bio = userdetails?.biolexical || undefined;
    const [urlsUpdated, setUrlsUpdated] = useState<boolean>(false);

    const { register, handleSubmit, setValue, watch, control, formState: { errors } } = useForm<z.infer<typeof UserValidation>>({
        resolver: zodResolver(UserValidation),
        defaultValues: {
            handle: userdetails?.handle || undefined,
            displayname: userdetails?.displayname || undefined,
            bio: bio,
            urls: userdetails?.urls?.map(url => ({ urlname: url.urlname, url: url.url })) || []
        }
    })

    const { fields: urlFields, append: appendUrl, remove: removeUrl } = useFieldArray({
        control,
        name: 'urls'
    })

    const avatarRegister = register('avatar')

    const refreshHandle = async () => {
        setHandleError(null);
        setIsGeneratingHandle(true);

        try {
            const nextHandle = await getHandleSuggestion({
                currentHandle: watch('handle') || userdetails?.handle || undefined,
                currentUserId: userdetails.userid
            });

            setValue('handle', nextHandle, {
                shouldDirty: true,
                shouldValidate: true
            });
        } catch {
            setHandleError('Could not generate a new handle right now.');
        } finally {
            setIsGeneratingHandle(false);
        }
    }

    const sendFile = async (filedata:{file:File, userdir:string}) => {
        const {file, userdir} = filedata;
        await uploadViaWorker(file, userdir);
        setAvatarUrl(`${avatarUrlBase}/${userdir}/${file.name}`);
    }

    const setTempFile = async (file:File | undefined) => {
        if (file) {
            const fileObj:OptimizedFile = {
                name: '',
                type:'',
                url:''
            };

            let fileUrl;

            if (file.type.match(/image/)) {
                fileUrl = await compressImage(file, 100, 100);
                fileObj.type = 'image/webp';
                fileObj.name = file.name.split('.')[0] +'.webp';
            } 

            fileObj.url = fileUrl || '';

            setAvatarUrl('');
            setTempImage(fileObj);
        }
    }

    const onSubmit = async (values: z.infer<typeof UserValidation>) => {
        setIsSaving(true);
        let id = userdetails?.id;
        let userdir = userdetails?.userdir || getRandomString(10);
        let avatarUrl = userdetails?.avatar || undefined;

        try {
            if (tempImage && userdir) {
                const res = await fetch(tempImage.url);
                const blob = await res.blob();
                const file = new File([blob], tempImage.name, {type: tempImage.type})
                const formData = new FormData();
                formData.append('file', file);
                formData.append('userdir', userdir);

                sendFile({file, userdir});

                avatarUrl = file.name;
            }

            if (values.bio && values.bio.html && values.bio.lexical) {
                const {lexical} = values.bio;
                values.bio.lexical = JSON.stringify(lexical);
            }

            const savedUserdetails = await saveUser({
                id: id || undefined,
                userid: userdetails.userid,
                handle: hasPermanentHandle ? userdetails?.handle || undefined : values.handle,
                biohtml: values.bio.html,
                biolexical: values.bio.lexical,
                displayname: values.displayname,
                userdir,
                avatar: avatarUrl,
                urlsUpdated,
                urls: values.urls?.map((url) => ({urlname: url.urlname.trim(), url: url.url.trim()})).filter(Boolean) || []
            })

            if (values.displayname && values.displayname !== '' && !userOnboarded) {
                setUserOnboarded(true)
            }

            setHandleError(null);

            setUserDetails((previous) => ({
                ...previous,
                ...savedUserdetails,
                urls: previous.urls
            }))
            setUrlsUpdated(false);
            dispatchEvent(new CustomEvent('profileUpdated', {
                detail: {
                    handle: savedUserdetails.handle
                }
            }));
        } catch (error) {
            console.error(error);
            setHandleError(error instanceof Error ? error.message : 'Could not save your handle.');
        }

        setIsSaving(false);
    }

    const addLinkInput = () => {
        appendUrl({urlname: '', url: '' });
        setUrlsUpdated(true);
    }

    const deleteLink = (index:number) => {
        removeUrl(index);
        setUrlsUpdated(true);
    }

    useEffect(() => {
        if (!userdetails?.handle) {
            void refreshHandle();
        }
    }, [])

    return (
        <div>
            <section className="">
                <form 
                    className=""
                    onSubmit={handleSubmit(onSubmit)}
                    encType="multipart/form-data"
                >
                    <div className="mb-4">
                        <label className="flex items-center text-lvartsmusic-muted mb-2" htmlFor="avatar">
                            <div>Avatar</div>
                            <div className="text-xs ms-1">(square images work best)</div>
                        </label>
                        <input 
                            {...avatarRegister}
                            type="file"
                            id="avatar"
                            className="hidden"
                            accept={ACCEPTED_IMAGE_TYPES.join(',')}
                            onChange={(event) => {
                                const file = event.target.files?.[0];
                                avatarRegister.onChange(event);
                                setValue('avatar', file, { shouldValidate: true });
                                setTempFile(file);
                            }}
                        />
                        <label htmlFor="avatar" className="cursor-pointer">
                            {avatarUrl && avatarUrl !== '' ?
                            <img src={avatarUrl} className='w-[80px] h-[80px] rounded-full'/>
                            :
                            tempImage ?
                            <img src={tempImage.url} className='w-[80px] h-[80px] rounded-full'/>
                            :
                            <BiImageAdd size={40} title="upload an image" />
                            }
                        </label>
                    </div>
                    <div className="mb-4">
                        <label className="block text-lvartsmusic-muted mb-2" htmlFor="handle">
                            Handle
                        </label>
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray-500">@</div>
                                <input
                                    type='text'
                                    className="disabled:cursor-not-allowed disabled:text-gray-500"
                                    id="handle"
                                    disabled={hasPermanentHandle}
                                    {...register('handle', { required: true })}
                                    onChange={(event) => {
                                        setValue('handle', normalizeHandle(event.target.value), {
                                            shouldDirty: true,
                                            shouldValidate: true
                                        });
                                    }}
                                />
                            </div>
                            {!hasPermanentHandle &&
                                <Button
                                    type='button'
                                    className="bg-transparent text-gray-600 shadow-none hover:bg-gray-100 cursor-pointer"
                                    onClick={refreshHandle}
                                    disabled={isGeneratingHandle || isSaving}
                                    title="Generate a handle"
                                >
                                    {isGeneratingHandle ? <Spinner/> : <BiRefresh />}
                                </Button>
                            }
                        </div>
                        <div className="mt-2 text-xs text-lvartsmusic-muted">
                            {hasPermanentHandle
                                ? 'Your handle is permanent.'
                                : 'Enter a custom handle or generate one. You can only set it once.'}
                        </div>
                        {(errors.handle || handleError) &&
                            <div className="mt-2 text-xs italic text-red-500">{errors.handle?.message || handleError}</div>
                        }
                    </div>
                    <div className="mb-4">
                        <label className="block text-lvartsmusic-muted mb-2" htmlFor="displayname">
                            Display Name
                        </label>
                        <input
                            type='text'
                            id="displayname"
                            {...register('displayname', { required: true })}
                        />
                        {
                        (!userOnboarded || errors.displayname) && 
                            <div className="text-red-500 text-xs italic mt-2">Please enter a name to get started. You can always change it later.</div>
                        }
                    </div>
                    <div className="mb-4">
                        <label className="block text-lvartsmusic-muted mb-2" htmlFor="bio">
                            Bio
                        </label>
                        <Controller
                            control={control}
                            name='bio'
                            render={({ field }) => (
                                <RTEditor
                                    ref={editorRef}
                                    onChange={field.onChange}
                                    clearEditor={false}
                                    content={bio}
                                    currentUserDetailsId={userdetails?.id || 0}
                                />
                            )}
                        />
                    </div>
                    <div className="mb-4">
                        <label className="flex justify-between text-lvartsmusic-muted mb-2" htmlFor="urls">
                            <div>Links</div> 
                            <div><Button type='button' className='bg-transparent text-gray-600 cursor-pointer shadow-none hover:bg-gray-100' onClick={addLinkInput}><BiPlus /></Button></div>
                        </label>
                        <div>
                        {urlFields.map((field, index:number) => {
                            return (
                                <div className="flex w-full mb-2" key={field.id}>
                                    <div className="flex w-full gap-3">
                                        <input
                                            type='text'
                                            id={`urls${index}urlname`}
                                            placeholder='Link Name, e.g. Instagram'
                                            onFocus={() => setUrlsUpdated(true)}
                                            {...register(`urls.${index}.urlname`)}
                                        />
                                        <input
                                            type='text'
                                            id={`urls${index}url`}
                                            placeholder='Link URL'
                                            onFocus={() => setUrlsUpdated(true)}
                                            {...register(`urls.${index}.url`)}
                                        />
                                    </div>
                                    <div>
                                        <Button type='button' className="bg-transparent shadow-none flex w-10 text-red-700 justify-center align-middle hover:bg-transparent cursor-pointer" onClick={() => deleteLink(index)}>
                                            <BiX />
                                        </Button>
                                    </div>
                                </div>
                            )
                        })}
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <Button type='submit' className="bg-orange px-3.5 py-1.5 rounded-full text-white uppercase font-semibold cursor-pointer disabled:bg-orange-200 text-sm" disabled={(isSaving) ? true : false}>
                            Save
                        </Button>
                        {
                            isSaving && 
                            <div className="ms-2">
                                <Spinner/>
                            </div>
                        }
                    </div>
                </form>
            </section>
        </div>
    )
}

export default AccountInfo
