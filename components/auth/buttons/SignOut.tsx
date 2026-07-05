'use client'

import { signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { BiExit } from "react-icons/bi";
 
export default function SignOut(props:{shade?:string}) {
    const [shadeClass, setShadeClass] = useState<string>((props.shade && props.shade === 'dark') ? "leftIcon_dark" : "leftIcon");
    const router = useRouter();

    const signOutUser = () => {
        signOut();
        setTimeout(() => {
            router.push('/');
        }, 1000)      
    }

    return (
        <div className='flex justify-center mt-5'>
            <button onClick={signOutUser} className='text-sm flex flex-row items-center cursor-pointer text-[var(--lvartsmusic-muted)]' title='Sign out'>
                Sign Out <BiExit className={`${shadeClass} ms-2`}/>
            </button>
        </div>
    )
}