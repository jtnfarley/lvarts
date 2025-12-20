"use client"

import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react"
import Image from "next/image";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";
import GenericModal from "@/components/Modal/GenericModal";
 
export default function SignIn() {
    const [error, setError] = useState<string | undefined>();
    const [open, setOpen] = useState<boolean>(false);

    const signInUser = (provider:string) => {
        const options = {redirectTo: '/home', email:''}
        if (provider === 'nodemailer') {
            const email = document.getElementById('email') as HTMLInputElement;
            
            if (email.value !== '')
                options.email = email.value;
            else {
                setError('Email required')
                return;
            }
        }

        signIn(provider, options);
    }

    // useEffect(() => {
    //     const cookie = document.cookie;
    //     const url = '/';
    //     if (!cookie.match('chortle=')) {
    //         redirect(url);
    //     } else {
    //         const cookies = document.cookie.split(';');
    //         cookies.forEach((cookie) => {
    //             if (cookie.match('chortle=')) {
    //                 const invite = cookie.split('=');
    //                 if (atob(invite[1]) !== 'invitationVerified=true') {
    //                     redirect(url);
    //                 }
    //             }
    //         })
    //     }
    // }, [])
    return (
        <div className="gap-5 p-5">
            <div className="flex justify-center">
                <Image
                    src='/logos/lvarts-paths.svg'
                    alt="Lehigh Valley Arts & Music"
                    width={500}
                    height={195}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
            </div>

            <div className="flex flex-col mt-5 justify-center items-center">
                <button onClick={() => signInUser('google')} className='bg-white w-72 flex justify-center px-3 py-3 rounded-full'>
                    Sign In with Google 
                    <div className='ms-3'><img src='/images/goog.png' alt='Google Icon' className='w-[30px] h-[30px]'/></div>
                </button>
                <div className="flex justify-center my-3 border-b-2 border-gray-200 w-100"></div>
                <div className="mb-2">Sign In with Email</div>
                <div className="flex items-center">
                    <input type='text' name='email' id='email' placeholder='Email' className="border-2 px-2 py-2 me-2 rounded-md bg-white"/>
                    <Button onClick={() => signInUser('nodemailer')}>Send Link</Button>
                </div>
                {error && 
                    <div className='text-red-500'>Please enter a valid email address</div>
                }
            </div>
            <div className='flex justify-center mt-10'>
                <button onClick={() => setOpen(true)} className="text-primary">What is this?</button>
                <GenericModal title="What this is:" message="Lehigh Valley Arts & Music is a local social community focused on promoting artists and the arts in the Lehigh Valley. It is a gathering place for artists and fans to talk about the latest events and trends in the valley. Promote your show or gallery opening. Display your artwork or post your videos. Find your new favorite band. Post your perosnal Musikfest schedule. Engage with the community. Meet up and collaborate." onClose={() => setOpen(false)} children="" isOpen={open}/>
            </div>
        </div>
    )
}