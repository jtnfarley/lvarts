'use client'

import { useForm } from "react-hook-form";
import { Button } from '@/components/ui/button';
import * as z from 'zod';
import { zodResolver } from "@hookform/resolvers/zod";
import { updateUser } from "@/app/actions/user"
import User from "@/lib/models/user";
import { BiImageAdd } from "react-icons/bi";
import { useState } from "react";
import uploadFile from "@/app/actions/fileUploader";
import { getRandomString } from "@/lib/utils";
import imageUrl from '@/constants/imageUrl';
import { compressImage } from "@/lib/utils";
import OptimizedFile from "@/lib/models/optimizedFile";
import { Spinner } from "../layout/Spinner"


const MAX_UPLOAD_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const UserValidation = z.object({
    displayName: z.string().min(1).max(100),
    bio: z.string().max(4000).optional(),
    avatar: z.any().optional(),    
})

const AccountInfo = (props:{user: User}) => {
    const [user, setUser] = useState<User>(props.user);

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

    const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<z.infer<typeof UserValidation>>({
        resolver: zodResolver(UserValidation),
        defaultValues: {
            displayName: user.userDetails?.displayName || undefined,
            bio: user.userDetails?.bio || undefined,
        }
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
            
            const userDetails = await updateUser({
                id,
                userId: user.id,
                bio: values.bio,
                displayName: values.displayName,
                userDir,
                avatar: avatarUrl
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

    // const generateInviteCodes = async () => {
    //     const codes = await generateCodes(10)
    //     console.log(codes)
    // }

    return (
        <div>
            <section className="">
                <form 
                    className=""
                    onSubmit={handleSubmit(onSubmit)}
                    encType="multipart/form-data"
                >
                    <div className="mb-4">
                        <label className="flex items-center text-gray-700 font-medium mb-2" htmlFor="name">
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
                        <label className="block text-gray-700 font-medium mb-2" htmlFor="name">
                            Display Name
                        </label>
                        <input
                            className="bg-white border border-gray-400 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:border-indigo-500"
                            id="displayName"
                            {...register('displayName', { required: true })}
                        />
                        {
                        (!userOnboarded || errors.displayName) && 
                            <div className="text-red-500 text-xs italic mt-2">Please enter a name to get started. You can always change it later.</div>
                        }
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 font-medium mb-2" htmlFor="name">
                            Bio
                        </label>
                        <textarea
                            className="bg-white border border-gray-400 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:border-indigo-500 h-30"
                            id="bio"
                            {...register('bio')}
                        />
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
