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
        <button onClick={signOutUser} className='text-lg flex flex-row items-center cursor-pointer' title='Sign out'>
            <BiExit className={shadeClass}/>
            <div className='hidden md:block'></div>
        </button>
    )
}