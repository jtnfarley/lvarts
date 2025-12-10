'use client'

import Image from "next/image";
import { redirect } from 'next/navigation';
import { useEffect } from "react";

export default function LandingPage() {
    const verification = '4t93u4gf9erg95t95wefsdv';

    const checkCode = (ev:any) => {
        ev.preventDefault()
        if (ev.target.code.value === verification) {
            document.cookie = `chortle=${btoa('invitationVerified=true')}`;
            redirect('/signin');
        }
    }

    useEffect(() => {
        const cookies = document.cookie.split(';');
        cookies.forEach((cookie) => {
            if (cookie.match('chortle=')) {
                const invite = cookie.split('=');
                if (atob(invite[1]) === 'invitationVerified=true') {
                    redirect('/signin');
                }
            }
        })
    }, [])

    return (
        <div className="gap-5 p-5">
            <div className="flex justify-center">
                <Image
                    src='/logos/lvarts.svg'
                    alt="Lehigh Valley Arts & Music"
                    width={500}
                    height={195}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
            </div>
            <div className='w-120 my-3'>
                Right now, membership is by invitation only. If you received an invitation code, please enter it below.
            </div>
            <div className='flex justify-center'>
                <form onSubmit={checkCode}>
                    <input placeholder='Invitation code' name='code'/>
                    <button type='submit'>Verify</button>
                </form>
            </div>
        </div>
    )
}