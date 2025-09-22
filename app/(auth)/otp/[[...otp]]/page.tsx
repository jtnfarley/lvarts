'use client'

import { 
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import { Button } from '@/components/ui/button'
import { useForm } from "react-hook-form";
import * as z from 'zod'
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { redirect } from "next/navigation"

const FormSchema = z.object({
    otp: z.string().min(6, {
        message: "Your one-time password must be 6 characters.",
    }),
})

const OtpForm = () => {
    const [error, setError] = useState("")

    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            otp: "",
        },
    })

    const onSubmit = async (values: z.infer<typeof FormSchema>) => {
		const { otp } = values

        // const formData = new FormData({otp});
        // const data = Object.fromEntries(formData.entries());

        const response = await fetch('/api/verifyOtp', {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            },
            body: JSON.stringify({otp}),
        });

        const user = await response.json();

        if (!user) {
            setError("One-time password is invalid")
        } else {
            redirect('/')
        }
    }

    return (
        <div>
            <h1>Verify Account</h1>
            <p>Enter the one-time password sent to your email</p>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="w-2/3 space-y-6">
                    <FormField
                    control={form.control}
                    name="otp"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>One-Time Password</FormLabel>
                        <FormControl>
                            <InputOTP maxLength={6} {...field}>
                            <InputOTPGroup>
                                <InputOTPSlot index={0} />
                                <InputOTPSlot index={1} />
                                <InputOTPSlot index={2} />
                                <InputOTPSlot index={3} />
                                <InputOTPSlot index={4} />
                                <InputOTPSlot index={5} />
                            </InputOTPGroup>
                            </InputOTP>
                        </FormControl>
                        <FormDescription>
                            Please enter the one-time password sent to your email.
                        </FormDescription>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <p className="text-red-500">{error}</p>
                    <Button type="submit">Submit</Button>
                </form>
            </Form>
        </div>
    )
}

export default OtpForm