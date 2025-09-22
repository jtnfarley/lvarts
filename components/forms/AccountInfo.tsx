'use client'

import { useForm } from "react-hook-form";
import { 
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "../ui/form";
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import * as z from 'zod'
import { UserValidation } from "@/lib/validations/user";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateUser } from "@/lib/data/user.data";
import { usePathname, useRouter } from "next/navigation";
import { Router } from "next/router";
import { useEffect, useState } from "react";

interface Props {
    user: {
        id: string;
        bio: string;
    }
}

const AccountInfo = ({user}: Props) => {
    const pathname = usePathname()
    const router = useRouter()
    const [showBio, setShowBio] = useState<boolean>(false)

    useEffect(() => {
        setTimeout(() => {
            setShowBio(true)
        }, 1000)
    })

    const form = useForm<z.infer<typeof UserValidation>>({
        resolver: zodResolver(UserValidation),
        defaultValues: {
            bio: user?.bio || '',
        }
    })

    const onSubmit = async (values: z.infer<typeof UserValidation>) => {
        console.log(values)
        await updateUser({
            userId: user.id,
            bio: values.bio,
            path: pathname
        })

        if (pathname === '/profile/edit') {
            router.back()
        } else {
            router.push('/')
        }
    }

    if (!showBio) {
        return (
            <h1 className="text-2xl font-bold text-light-1">Loading...</h1>
        )
    }
    
    return (
        <div>
            <section className="mt-9 bg-dark-2 p-10">
                <Form {...form}>
                    <form 
                        className="space-y-4"
                        onSubmit={form.handleSubmit(onSubmit)}
                    >
                        <FormField
                            control={form.control}
                            name="bio"
                            render={({ field }) => (
                                <FormItem className="flex w-full flex-xol gap-3">
                                    <FormLabel className="text-base-semibold text-light-2">Bio</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            rows={10}
                                            className="account-form_input no-focus"
                                            placeholder="Tell us about yourself"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type='submit' className="bg-primary-500">
                            Save
                        </Button>
                    </form>
                </Form>
            </section>
        </div>
    )
}

export default AccountInfo