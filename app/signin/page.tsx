"use client"
import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react"
import Image from "next/image";
import { useState } from "react";
 
export default function SignIn() {
    const [error, setError] = useState<string | undefined>()
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
                <div>
                    <input type='text' name='email' id='email' placeholder='Email' className="border-2 px-2 py-2 me-2 rounded-md w-80 bg-white"/>
                    <Button onClick={() => signInUser('nodemailer')}>Send Link</Button>
                    {error && 
                        <div className='text-red-500'>Please enter a valid email address</div>
                    }
                </div>
            </div>
        </div>
    )
}

// 'use server'

// import Image from "next/image";
// import { cookies } from "next/headers";
// import { redirect } from 'next/navigation';

// import GoogleSignIn from "../../components/auth/buttons/GoogleSignIn";
// import EmailSignIn from "../../components/auth/buttons/EmailSignIn";
// import { currentUser } from '@/app/actions/currentUser';

// export default async function SigninPage() {
//     const cookieStore = await cookies();
//     const invited = cookieStore.get('chortle');
//     if (!invited || atob(invited.value) !== 'invitationVerified=true') return redirect('/');

//     const getUser = async () => {
//             'use server'
//             return await currentUser()
//         }
    
//     const user = await getUser();

//     if (user) return redirect('/home');

//     return (
//         <div className="gap-5 p-5">
//             <div className="flex justify-center">
//                 <Image
//                     src='/logos/lvarts-paths.svg'
//                     alt="Lehigh Valley Arts & Music"
//                     width={500}
//                     height={195}
//                     sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
//                 />
//             </div>

//             <div className="flex items-center lg:items-start mt-5 justify-between">
//                 <div><GoogleSignIn/></div>
//                 <div><EmailSignIn/></div>
//             </div>
//         </div>
//     )
// }