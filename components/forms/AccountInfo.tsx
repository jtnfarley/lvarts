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

const UserValidation = z.object({
    displayName: z.string().min(1).max(100),
    bio: z.string().max(4000).optional(),
    avatarUrl: z.string().optional(),    
    // postFile: z.string(), 
    // privatePost: z.boolean(), 
    // parentPostId: z.string()
})

const AccountInfo = (props:{user: User}) => {
    const user = props.user;

    if (!user) {
        return (
            <h1 className="text-2xl font-bold text-light-1">You shall not pass!</h1>
        )
    }

    const [userOnboarded, setUserOnboarded] = useState(user.userDetails && user.userDetails.displayName && user.userDetails.displayName !== '')

    const pathname = usePathname();
    const router = useRouter();

    const { register, handleSubmit, reset, formState: { errors } } = useForm<z.infer<typeof UserValidation>>({
        resolver: zodResolver(UserValidation),
        defaultValues: {
            displayName: user.userDetails?.displayName || undefined,
            bio: user.userDetails?.bio || undefined,
            avatarUrl: undefined
        }
    })

    const onSubmit = async (values: z.infer<typeof UserValidation>) => {
        const id = user.userDetails?.id!
        await updateUser({
            id,
            userId: user.id,
            bio: values.bio,
            displayName: values.displayName,
        })

        if (values.displayName && values.displayName !== '' && !userOnboarded) {
            setUserOnboarded(true)
        }
    }

    return (
        <div>
            <section className="">
                <form 
                    className=""
                    onSubmit={handleSubmit(onSubmit)}
                >
                    <div className="mb-4">
                        <label className="block text-gray-700 font-medium mb-2" htmlFor="name">
                            Avatar
                        </label>
                        <input type="file" name="avatar" id="avatar" className="hidden" />
                        <label htmlFor="avatar" className="cursor-pointer">
                            <BiImageAdd size={40} title="upload an image" />
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
                            {...register('bio', { required: true })}
                        />
                    </div>

                    <Button type='submit' className="bg-primary">
                        Save
                    </Button>
                </form>
            </section>
        </div>
    )
}

export default AccountInfo