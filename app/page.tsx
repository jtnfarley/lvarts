import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import LandingPage from '@/components/LandingPage';
 
export default async function SignIn() {
    const session = await auth();

    if (session?.user && session?.user?.id) {
        return redirect('/home');
    }

    return (
        <div className="flex items-center justify-center h-screen">
            <LandingPage/>
        </div>
    )
}