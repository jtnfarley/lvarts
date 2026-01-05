'use client'

import { signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation';
import { BiSolidArrowToLeft } from "react-icons/bi";
 
export default function SignOut() {
    const router = useRouter();

    const signOutUser = () => {
        signOut();
        setTimeout(() => {
            router.push('/');
        }, 1000)      
    }

    return (
        <button onClick={signOutUser} className='text-gray-500 text-lg flex flex-row items-center'>
            <BiSolidArrowToLeft className='leftIcon'/>
            <div className='hidden md:block'>Log Out</div>
        </button>
    )
}