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
// import { generateCodes } from '@/app/actions/invitationCodes';


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

    const avatarUrlBase = `https://lvartsmusic-ny.b-cdn.net/`
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

    const onSubmit = async (values: z.infer<typeof UserValidation>) => {
        let id = user.userDetails?.id;
        let userDir = user.userDetails?.userDir || getRandomString(10);
        let avatarUrl = user.userDetails?.avatar || undefined;

        try {
            if (values.avatar.name) {
                const file = values.avatar;
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
                        <label className="block text-gray-700 font-medium mb-2" htmlFor="name">
                            Avatar
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
                                if (file)
                                    setAvatarUrl(URL.createObjectURL(file))
                            }}
                        />
                        <label htmlFor="avatar" className="cursor-pointer">
                            {avatarUrl ?
                            <img src={avatarUrl} className='w-[40px] h-[40px]'/>
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
                            className="border border-gray-400 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:border-indigo-500"
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
                            className="border border-gray-400 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:border-indigo-500 h-30"
                            id="bio"
                            {...register('bio')}
                        />
                    </div>

                    <Button type='submit' className="bg-primary">
                        Save
                    </Button>
                </form>
            </section>
            {/* <button onClick={() => generateInviteCodes()}>Generate Invite Codes</button> */}
        </div>
    )
}

export default AccountInfo
