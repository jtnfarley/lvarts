"use client"

import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react"
import Image from "next/image";
import { useState } from "react";
import { useModal } from '@/app/contextProviders/modalProvider'
 
export default function LandingPage() {
    const [error, setError] = useState<string | undefined>();
    const [showAlert, setShowAlert] = useState<boolean>(false);
    const {
            setIsOpen, 
            setTitle, 
            setType,   
            setMessage,
        } = useModal()

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

    const setUpAboutModal = () => {
		setIsOpen(true);
        setTitle('What this is:');
        setType('GenericModal');  
        setMessage(`Lehigh Valley Art & Music is a gathering place to promote and discover the thriving Lehigh Valley art scene. It's like Twitter/X without sociopathic billionaires and Russian troll farms mucking it up. If you're not a troll bot, or a sociopathic billionaire, please join us. Promote your show. Display your work. Find your new favorite band. Post your Musikfest schedule. Engage and collaborate.`);
	}

    const setUpPrivacyModal = () => {
		setIsOpen(true);
        setTitle('Privacy Policy');
        setType('GenericModal');  
        setMessage(`This site is run by a guy in Whitehall who has no interest in selling your data. With that said, this is a public website, and the Internet is overrun with bad actors. There's always a chance your data will leak out. Fortunately we don't store a lot of personal data. Just your name, email and your Google avatar, if you have one, but that's all mostly public anyway.`);
	}

     const setUpCookieModal = () => {
		setIsOpen(true);
        setTitle('Cookies! Mmmmmm');
        setType('GenericModal');  
        setMessage(`This site just uses functional cookies to keep you signed in. We don't use any tracking cookies or other such nonsense. You are not the product here.`);
	}

    return (
        <div className="flex items-center justify-center h-screen ">
            <div className="p-5 gap-2 bg-gray-900/25 backdrop-blur-sm rounded-2xl xl:w-[600px]">
                <div className="flex justify-center">
                    <Image
                        src='/logos/lvarts-artsy-paths.svg'
                        alt="Lehigh Valley Arts & Music"
                        width={500}
                        height={195}
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        priority
                        className="w-full rounded-sm"
                    />
                </div>

                <div className="flex flex-col my-5 justify-center items-center">
                    <button onClick={() => signInUser('google')} className='bg-white w-72 flex justify-center px-3 py-3 rounded-full my-5'>
                        Sign Up/Sign In with Google 
                        <div className='ms-3'><img src='/images/goog.png' alt='Google Icon' className='w-[30px] h-[30px]'/></div>
                    </button>
                    <div className="flex justify-center my-3 border-b-1 border-gray-600 w-2/3"></div>
                    <div className="my-2 text-white">Sign Up/Sign In with Email</div>
                    <div className="flex items-center mb-2">
                        <input type='text' name='email' id='email' placeholder='Email' className="border-2 px-2 py-2 me-2 rounded-md bg-white" 
                            onFocus={() => setShowAlert(true)}
                        />
                        <Button onClick={() => signInUser('nodemailer')} className='px-3 py-5.5'>Send Link</Button>
                    </div>
                    {showAlert && 
                        <div className='text-green-900 bg-white py-1 px-2 rounded-sm'><em>Be sure to check your spam folder for the sign-in link.</em></div>
                    }
                    {error && 
                        <div className='text-red-800 bg-white py-1 px-2 rounded-sm'>Please enter a valid email address</div>
                    }
                </div>
                <div className='flex flex-col items-center justify-center mt-25 gap-3'>
                    <Link href='/calendar' className="flex justify-center text-white bg-orange py-2 px-2 rounded-sm w-1/2">Lehigh Valley Events Calendar</Link>
                    <Link href='/gallery' className="flex justify-center text-white bg-orange py-2 px-2 rounded-sm w-1/2">Lehigh Valley Community Art Gallery</Link>
                </div>
                <div className='flex justify-center mt-5 gap-5'>
                    <button onClick={() => setUpAboutModal()} className="text-white cursor-pointer">What is this?</button>
                    <button onClick={() => setUpPrivacyModal()} className="text-white cursor-pointer">Privacy Policy</button>
                    <button onClick={() => setUpCookieModal()} className="text-white cursor-pointer">Cookie Policy</button>
                </div>
        </div>
        </div>
    )
}