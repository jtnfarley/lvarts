'use client'

import { usePathname, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Button } from '@/components/ui/button';
import * as z from 'zod';
import { zodResolver } from "@hookform/resolvers/zod";
import { updateUser } from "@/app/actions/user"
import User from "@/lib/models/user";
import { BiImageAdd } from "react-icons/bi";
import { useState } from "react";
import uploadFile from "@/app/actions/fileUploader";

const MAX_UPLOAD_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const ImageUpload = (props:{register:Function, setValue:Function, setTempImage:Function}) => {
    // const avatarUrlBase = `https://lvartsmusic-ny.b-cdn.net/`
    // const avatarUrlInit = user.userDetails && user.userDetails.avatar && user.userDetails.userDir ? `${avatarUrlBase}/${user.userDetails.userDir}/${user.userDetails.avatar}` : undefined

    // const [avatarUrl, setAvatarUrl] = useState<string | undefined>(avatarUrlInit);

    const postFileRegister = props.register('postFileObj')

    // const sendFile = async (filedata:{file:File, userDir:string}) => {
    //     const {file, userDir} = filedata;
    //     await uploadFile({file, userDir});
    //     setAvatarUrl(`${avatarUrlBase}/${userDir}/${file.name}`);
    // }

    // const onSubmit = async (values: z.infer<typeof UserValidation>) => {
    //     let id = user.userDetails?.id;
    //     let userDir = user.userDetails?.userDir || getRandomString(10);
    //     let avatarUrl = user.userDetails?.avatar || undefined;

    //     try {
    //         if (values.avatar) {
    //             const file = values.avatar;
    //             const formData = new FormData();
    //             formData.append('file', file);
    //             formData.append('userDir', userDir);

    //             sendFile({file, userDir});

    //             // const uploadResponse = await fetch('/api/upload', {
    //             //     method: 'POST',
    //             //     body: formData
    //             // });

    //             // if (!uploadResponse.ok) {
    //             //     console.error('Failed to upload avatar');
    //             //     return;
    //             // }

    //             // const data = await uploadResponse.json();
    //             avatarUrl = file.name;
    //         }
            
    //         const userDetails = await updateUser({
    //             id,
    //             userId: user.id,
    //             bio: values.bio,
    //             displayName: values.displayName,
    //             userDir,
    //             avatar: avatarUrl
    //         })

    //         if (values.displayName && values.displayName !== '' && !userOnboarded) {
    //             setUserOnboarded(true)
    //         }

    //         user.userDetails = userDetails;

    //         setUser({...user})
    //     } catch (error) {
    //         console.error(error);
    //     }
    // }

    return (
        <div className=" bg-gray-300 rounded-sm w-[40px]">
            <input 
                {...postFileRegister}
                type="file"
                id="postFileObj"
                className="hidden"
                accept={ACCEPTED_IMAGE_TYPES.join(',')}
                onChange={(event) => {
                    const file = event.target.files?.[0];
                    postFileRegister.onChange(event);
                    props.setValue('postFileObj', file, { shouldValidate: true });
                    props.setTempImage(file);
                }}
            />
            <label htmlFor="postFileObj" className="cursor-pointer">
                <BiImageAdd size={40} title="upload an image" />
            </label>
        </div>
    )
}

export default ImageUpload
