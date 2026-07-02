"use client"

import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react"
import Image from "next/image";
import { useEffect, useState } from "react";
import { useModal } from '@/app/contextProviders/modalProvider'
import { BG_IMAGES } from '@/components/layout/RandoBgs'

export default function LandingPage() {
    const [error, setError] = useState<string | undefined>();
    const [showAlert, setShowAlert] = useState<boolean>(false);
    const [bg, setBg] = useState<string | undefined>();
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

    useEffect(() => {
        setBg(BG_IMAGES[Math.floor(Math.random() * BG_IMAGES.length)]);
    },[])

    return (
        <div className="flex min-h-screen items-center justify-center p-4">
            <div className="flex w-full max-w-4xl overflow-hidden rounded-3xl border border-lvartsmusic-border bg-lvartsmusic-card shadow-2xl">
                <div className="flex w-full flex-col justify-center p-8 md:w-1/2 md:p-12">
                    <div className="flex justify-center mb-8">
                        <Image
                            src='/logos/lvarts-artsy-paths.svg'
                            alt="Lehigh Valley Arts & Music"
                            width={280}
                            height={110}
                            sizes="280px"
                            className="w-full max-w-[280px] rounded-sm"
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label htmlFor="email" className="text-sm font-medium text-lvartsmusic-foreground">Email</label>
                        <input type='text' name='email' id='email' placeholder='you@example.com'
                            onFocus={() => setShowAlert(true)}
                        />
                        <Button onClick={() => signInUser('nodemailer')} className='lvartsmusic-pill-accent w-full mt-1 text-white'>Send Link</Button>
                        {showAlert &&
                            <div className='text-sm text-lvartsmusic-muted'><em>Be sure to check your spam folder for the sign-in link.</em></div>
                        }
                        {error &&
                            <div className='text-sm text-red-600'>Please enter a valid email address</div>
                        }
                    </div>

                    <div className="flex items-center gap-3 my-6">
                        <div className="h-px flex-1 bg-lvartsmusic-border"></div>
                        <span className="text-xs text-lvartsmusic-muted">or</span>
                        <div className="h-px flex-1 bg-lvartsmusic-border"></div>
                    </div>

                    <button onClick={() => signInUser('google')} className='w-full flex items-center justify-center gap-3 rounded-full border border-lvartsmusic-border bg-white px-3 py-2.5 text-gray-700 font-medium hover:bg-gray-50 transition-colors'>
                        <img src='/images/goog.png' alt='Google Icon' className='w-[22px] h-[22px]'/>
                        Sign Up/Sign In with Google
                    </button>

                    <div className='flex flex-col sm:flex-row justify-center mt-8 gap-3'>
                        <Link href='/calendar' className="lvartsmusic-pill-outline text-center">Events Calendar</Link>
                        <Link href='/gallery' className="lvartsmusic-pill-outline text-center">Community Art Gallery</Link>
                    </div>

                    <div className='flex justify-center mt-6 gap-5'>
                        <button onClick={() => setUpAboutModal()} className="text-xs text-lvartsmusic-muted hover:text-lvartsmusic-accent cursor-pointer">What is this?</button>
                        <button onClick={() => setUpPrivacyModal()} className="text-xs text-lvartsmusic-muted hover:text-lvartsmusic-accent cursor-pointer">Privacy Policy</button>
                        <button onClick={() => setUpCookieModal()} className="text-xs text-lvartsmusic-muted hover:text-lvartsmusic-accent cursor-pointer">Cookie Policy</button>
                    </div>
                </div>

                <div className="relative hidden md:block md:w-1/2">
                    {bg && (
                        <Image
                            src={`/images/bgs/${bg}`}
                            alt=""
                            fill
                            priority
                            sizes="(max-width: 768px) 0px, 50vw"
                            className="object-cover"
                        />
                    )}
                </div>
            </div>
        </div>
    )
}
