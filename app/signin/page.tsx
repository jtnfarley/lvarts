'use server'

import Image from "next/image";
import { cookies } from "next/headers";
import { redirect } from 'next/navigation';

import GoogleSignIn from "../../components/auth/buttons/GoogleSignIn";
import EmailSignIn from "../../components/auth/buttons/EmailSignIn";
import { currentUser } from '@/app/actions/currentUser';

export default async function SigninPage() {
    const cookieStore = await cookies();
    const invited = cookieStore.get('chortle');
    if (!invited || atob(invited.value) !== 'invitationVerified=true') return redirect('/');

    const getUser = async () => {
            'use server'
            return await currentUser()
        }
    
    const user = await getUser();

    if (user) return redirect('/home');

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

            <div className="flex items-center lg:items-start mt-5 justify-between">
                <div><GoogleSignIn/></div>
                <div><EmailSignIn/></div>
            </div>
        </div>
    )
}