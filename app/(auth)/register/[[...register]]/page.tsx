'use client'

import { 
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Button } from '@/components/ui/button'
import { useForm } from "react-hook-form";
import * as z from 'zod'
import { zodResolver } from "@hookform/resolvers/zod";
import { RegisterValidation } from "@/lib/validations/user";
import { Input } from "@/components/ui/input";
import { createUser } from "@/lib/data/user.data";
import { useRouter } from "next/navigation"
import { useState } from "react";

const Register = () => {
    const router = useRouter()

    const [error, setError] = useState('')

    const form = useForm<z.infer<typeof RegisterValidation>>({
        resolver: zodResolver(RegisterValidation),
        defaultValues: {
            email: '',
        }
    })

    const onSubmit = async (values: z.infer<typeof RegisterValidation>) => {
		const { email, displayName } = values

        try {
            await createUser({
                email,
                displayName
            })

            router.push(`/otp`)
        } catch(err:any) {
            if (err.message.match(/E11000/)) {
                setError('Email already exists')
            }
        }
    }

    return (
        <div>
            <h1>Join Us</h1>
            
            <Form {...form}>
                <form 
                    className="mt-10 flex flex-col justify-start gap-10"
                    onSubmit={form.handleSubmit(onSubmit)}
                >
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem className="flex w-full flex-xol gap-3">
                                <FormLabel className="text-base-semibold ">Email*</FormLabel>
                                <FormControl className="no-focus border border-dark-4">
                                    <Input type='email' {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="displayName"
                        render={({ field }) => (
                            <FormItem className="flex w-full flex-xol gap-3">
                                <FormLabel className="text-base-semibold">Display Name</FormLabel>
                                <FormControl className="no-focus border border-dark-4">
                                    <Input />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <p className="text-red-500">{error}</p>
                    <Button type='submit' className="bg-primary-500">
                        Sign up
                    </Button>
                </form>
            </Form>
        </div>
    )
}

export default Register