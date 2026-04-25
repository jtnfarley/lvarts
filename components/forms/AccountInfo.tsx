'use client'

import { useFieldArray, useForm } from "react-hook-form";
import { Button } from '@/components/ui/button';
import * as z from 'zod';
import { zodResolver } from "@hookform/resolvers/zod";
import User from "@/lib/models/user";
import { BiImageAdd } from "react-icons/bi";
import { useState } from "react";
import uploadFile from "@/app/actions/fileUploader";
import { getRandomString } from "@/lib/utils";
import imageUrl from '@/constants/imageUrl';
import { compressImage } from "@/lib/utils";
import OptimizedFile from "@/lib/models/optimizedFile";
import type { UpdateUserParams } from "@/app/data/user";
import type UserDetails from "@/lib/models/userDetails";
import { Spinner } from "../layout/Spinner"
import { BiPlus, BiX } from "react-icons/bi";


const MAX_UPLOAD_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const UserValidation = z.object({
    displayName: z.string().min(1).max(100),
    bio: z.string().max(4000).optional(),
    avatar: z.any().optional(),   
    urls: z.array(z.object({ value: z.string() })).optional(), 
})

const AccountInfo = (props:{user: User, saveUser:(user: UpdateUserParams) => Promise<UserDetails>}) => {
    const [user, setUser] = useState<User>(props.user);
    const saveUser = props.saveUser;

    if (!user) {
        return (
            <h1 className="text-2xl font-bold text-light-1">You shall not pass!</h1>
        )
    }

    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [tempImage, setTempImage] = useState<OptimizedFile | undefined>();
    const avatarUrlBase = imageUrl;
    const avatarUrlInit = user.userDetails && user.userDetails.avatar && user.userDetails.userDir ? `${avatarUrlBase}/${user.userDetails.userDir}/${user.userDetails.avatar}` : undefined

    const [userOnboarded, setUserOnboarded] = useState(user.userDetails && user.userDetails.displayName && user.userDetails.displayName !== '')
    const [avatarUrl, setAvatarUrl] = useState<string | undefined>(avatarUrlInit);

    const { register, handleSubmit, setValue, control, formState: { errors } } = useForm<z.infer<typeof UserValidation>>({
        resolver: zodResolver(UserValidation),
        defaultValues: {
            displayName: user.userDetails?.displayName || undefined,
            bio: user.userDetails?.bio || undefined,
            urls: user.userDetails?.urls?.map((value) => ({ value })) || []
        }
    })

    const { fields: urlFields, append: appendUrl, remove: removeUrl } = useFieldArray({
        control,
        name: 'urls'
    })

    const avatarRegister = register('avatar')

    const sendFile = async (filedata:{file:File, userDir:string}) => {
        const {file, userDir} = filedata;
        await uploadFile({file, userDir});
        setAvatarUrl(`${avatarUrlBase}/${userDir}/${file.name}`);
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
                fileObj.type = 'image/png';
                fileObj.name = file.name.split('.')[0] +'.png';
            } 

            fileObj.url = fileUrl || '';

            setAvatarUrl('');
            setTempImage(fileObj);
        }
    }

    const onSubmit = async (values: z.infer<typeof UserValidation>) => {
        setIsSaving(true);
        let id = user.userDetails?.id;
        let userDir = user.userDetails?.userDir || getRandomString(10);
        let avatarUrl = user.userDetails?.avatar || undefined;

        try {
            if (tempImage && userDir) {
                const res = await fetch(tempImage.url);
                const blob = await res.blob();
                const file = new File([blob], tempImage.name, {type: tempImage.type})
                const formData = new FormData();
                formData.append('file', file);
                formData.append('userDir', userDir);

                sendFile({file, userDir});

                avatarUrl = file.name;
            }

            const userDetails = await saveUser({
                id,
                userId: user.id,
                bio: values.bio,
                displayName: values.displayName,
                userDir,
                avatar: avatarUrl,
                urls: values.urls?.map((url) => url.value.trim()).filter(Boolean) || []
            })

            if (values.displayName && values.displayName !== '' && !userOnboarded) {
                setUserOnboarded(true)
            }

            user.userDetails = userDetails;

            setUser({...user})
        } catch (error) {
            console.error(error);
        }

        setIsSaving(false);
    }

    const addLinkInput = () => {
        appendUrl({ value: '' })
    }

    const deleteLink = (index:number) => {
        removeUrl(index)
    }

    return (
        <div>
            <section className="">
                <form 
                    className=""
                    onSubmit={handleSubmit(onSubmit)}
                    encType="multipart/form-data"
                >
                    <div className="mb-4">
                        <label className="flex items-center text-gray-700 font-medium mb-2" htmlFor="avatar">
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
                        <label className="block text-gray-700 font-medium mb-2" htmlFor="displayName">
                            Display Name
                        </label>
                        <input
                            className="bg-white border border-gray-200 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:border-indigo-500"
                            id="displayName"
                            {...register('displayName', { required: true })}
                        />
                        {
                        (!userOnboarded || errors.displayName) && 
                            <div className="text-red-500 text-xs italic mt-2">Please enter a name to get started. You can always change it later.</div>
                        }
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 font-medium mb-2" htmlFor="bio">
                            Bio
                        </label>
                        <textarea
                            className="bg-white border border-gray-200 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:border-indigo-500 h-30"
                            id="bio"
                            {...register('bio')}
                        />
                    </div>
                    <div className="mb-4">
                        <label className="flex justify-between text-gray-700 font-medium mb-2" htmlFor="urls">
                            <div>Links</div> 
                            <div><Button type='button' className='bg-transparent text-gray-600 cursor-pointer shadow-none hover:bg-gray-100' onClick={addLinkInput}><BiPlus /></Button></div>
                        </label>
                        <div>
                        {urlFields.map((field, index:number) => {
                            return (
                                <div className="flex w-full" key={field.id}>
                                    <div className="flex-1">
                                        <input
                                            className="bg-white border border-gray-200 rounded w-full py-2 px-3 mb-2 text-gray-700 leading-tight focus:outline-none focus:border-indigo-500"
                                            id={`urls${index}`}
                                            {...register(`urls.${index}.value`)}
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

                    <div className="flex">
                        <Button type='submit' className="bg-primary cursor-pointer" disabled={(isSaving) ? true : false}>
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
